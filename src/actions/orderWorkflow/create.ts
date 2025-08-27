"use server";

import {
  getWebstoreById,
  getWorkflowWithIncludes,
} from "@/db/access/orderApproval";
import { prisma } from "@/prisma";
import {
  WebstoreEditorData,
  WebstoreLogEvent,
  WebstoreLogSeverity,
} from "@/types/schema/orderApproval";
import { encrypt } from "@/utility/misc";
import { revalidatePath } from "next/cache";

export async function createWorkflow(webstoreId: number, name: string) {
  await prisma.orderWorkflow.create({
    data: {
      name,
      webstoreId,
    },
  });
}

export async function duplicateWorkflow(
  workflowId: number,
  targetWebstoreId: number
) {
  const existingWorkflow = await getWorkflowWithIncludes(workflowId);
  if (!existingWorkflow) throw new Error(`Workflow ${workflowId} not found.`);

  const webstore = await getWebstoreById(targetWebstoreId);
  if (!webstore) throw new Error(`Webstore ${targetWebstoreId} not found.`);

  //check to make sure the target webstore is in a valid state to accept the duplicated workflow
  for (const step of existingWorkflow.steps) {
    const actionTargetIsEmail = step.actionTarget?.includes("@"); //assume only email addresses will have an @
    if (actionTargetIsEmail) {
      const existingUser = await prisma.orderWorkflowUser.findFirst({
        where: {
          AND: [
            {
              email: `${step.actionTarget}`,
            },
            {
              userRoles: {
                some: {
                  webstore: {
                    id: targetWebstoreId,
                  },
                },
              },
            },
          ],
        },
      });
      if (!existingUser)
        throw new Error(
          `Step with ID ${step.id} of existing workflow ${existingWorkflow.id} targets ${step.actionTarget}, but no user with that email address is associated with target webstore ${webstore.id}.`
        );
    }

    for (const listener of step.proceedListeners) {
      const fromValueIsEmail = listener.from.includes("@"); //assume only email addresses will have an @
      if (fromValueIsEmail) {
        const existingUser = await prisma.orderWorkflowUser.findFirst({
          where: {
            AND: [
              {
                email: listener.from,
              },
              {
                // roles: {
                //   some: {
                //     webstore: {
                //       id: targetWebstoreId,
                //     },
                //   },
                // },
                userRoles: {
                  some: {
                    webstore: {
                      id: targetWebstoreId,
                    },
                  },
                },
              },
            ],
          },
        });
        if (!existingUser)
          throw new Error(
            `Step with ID ${step.id} of existing workflow ${existingWorkflow.id} has a proceed listener with ID ${listener.id} with a "from" value of ${listener.from}, but no user with that email address is associated with target webstore ${webstore.id}.`
          );
      }
    }
  }

  //the checks have passed, so let's create the workflow using the existing data
  const newWorkflow = await prisma.orderWorkflow.create({
    data: {
      name: existingWorkflow.name,
      webstore: {
        connect: {
          id: webstore.id,
        },
      },
    },
  });

  for (const step of existingWorkflow.steps) {
    await prisma.orderWorkflowStep.create({
      data: {
        actionType: step.actionType,
        name: step.name,
        order: step.order,
        actionMessage: step.actionMessage,
        actionSubject: step.actionSubject,
        actionTarget: step.actionTarget,
        otherActionTargets: step.otherActionTargets,
        proceedImmediatelyTo: step.proceedImmediatelyTo,
        workflow: {
          connect: {
            id: newWorkflow.id,
          },
        },
        proceedListeners: {
          createMany: {
            data: step.proceedListeners.map((listener) => ({
              from: listener.from,
              goto: listener.goto,
              name: listener.name,
              type: listener.type,
            })),
          },
        },
      },
    });
  }

  return newWorkflow;
}

export async function createEventListener(
  parentStepId: number,
  fromValue: string
) {
  return prisma.orderWorkflowStepProceedListener.create({
    data: {
      stepId: parentStepId,
      name: "New Listener",
      type: "approve",
      from: fromValue,
      goto: "next",
    },
  });
}

export async function createStep(parentWorkflowId: number, order?: number) {
  return prisma.orderWorkflowStep.create({
    data: {
      workflowId: parentWorkflowId,
      name: "New Step",
      actionType: "email",
      order: order || 0,
      actionMessage: "Your message here",
      actionSubject: "Your Subject Here",
      proceedImmediatelyTo: "next",
      display: {
        create: {
          positionX: 0,
          positionY: 0,
        },
      },
    },
    include: {
      display: true,
    },
  });
}

export async function createDefaultWebstore() {
  const webstore = await prisma.webstore.create({
    data: {
      name: "New Webstore",
      url: "example.com",
      organizationName: "",
      apiKey: "",
      apiKeyEncryptIv: "",
      apiKeyEncryptTag: "",
      apiSecret: "",
      apiSecretEncryptIv: "",
      apiSecretEncryptTag: "",
    },
  });

  await prisma.webstoreShippingSettings.create({
    data: {
      webstoreId: webstore.id,
      allowApproverChangeMethod: true,
      allowUpsToCanada: false,
    },
  });

  return webstore;
}

export async function createOrConnectWebstoreUser(
  webstoreId: number,
  name: string,
  email: string
) {
  const existingUser = await prisma.orderWorkflowUser.findUnique({
    where: {
      email,
    },
    include: {
      userRoles: true,
    },
  });
  //use the webstore's first existing role; if none, create a default one to use
  //this will be needed whether we're creating a new user or connecting an existing one
  let firstRole = await prisma.webstoreUserRole.findFirst({
    where: {
      webstoreId,
    },
  });
  if (!firstRole) {
    firstRole = await prisma.webstoreUserRole.create({
      data: {
        webstoreId,
      },
    });
  }

  if (existingUser) {
    const alreadyConnected = existingUser.userRoles.find(
      (role) => role.webstoreId === webstoreId
    );
    if (alreadyConnected) return existingUser;

    const updatedRole = await prisma.webstoreUserRole.update({
      where: {
        id: firstRole.id,
      },
      data: {
        users: {
          connect: [{ id: existingUser.id }],
        },
      },
      include: {
        users: {
          where: {
            id: existingUser.id,
          },
        },
      },
    });

    const connectedUser = updatedRole.users[0];
    if (!connectedUser)
      throw new Error(
        `Something went wrong with connecting ${existingUser.id} to webstore ${webstoreId}.`
      );

    return connectedUser;
  } else {
    const newUser = await prisma.orderWorkflowUser.create({
      data: {
        email,
        name,
      },
    });
    await prisma.webstoreUserRole.update({
      where: {
        id: firstRole.id,
      },
      data: {
        users: {
          connect: [{ id: newUser.id }],
        },
      },
    });
    return newUser;
  }
  // const existingUser = await prisma.orderWorkflowUser.findUnique({
  //   where: {
  //     email,
  //   },
  //   include: {
  //     roles: true,
  //   },
  // });
  // if (existingUser) {
  //   const alreadyConnected = existingUser.roles.find(
  //     (role) => role.webstoreId === webstoreId
  //   );
  //   if (alreadyConnected) return existingUser;

  //   const newRole = await prisma.orderWorkflowWebstoreUserRole.create({
  //     data: {
  //       userId: existingUser.id,
  //       webstoreId: webstoreId,
  //       role: "approver",
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });

  //   return newRole.user;
  // } else {
  //   return createUser(email, name, webstoreId, "approver");
  // }
}

export async function createWebstoreCheckoutField(webstoreId: number) {
  return prisma.webstoreCheckoutField.create({
    data: {
      name: "",
      label: "",
      type: "text",
      webstoreId,
    },
  });
}

export async function createRole(webstoreId: number) {
  return prisma.webstoreUserRole.create({
    data: {
      webstoreId,
    },
  });
}

export async function createLog(
  webstoreId: number,
  text: string,
  severity: WebstoreLogSeverity,
  event: WebstoreLogEvent
) {
  //isolated try-catch because if log creation ever fails, it should not cause anything else to fail
  try {
    return prisma.webstoreLog.create({
      data: {
        webstoreId,
        text,
        severity,
        event,
      },
    });
  } catch (error) {
    console.error(
      `Failed to create webstore log! Webstore id: ${webstoreId}; text: ${text}; severity: ${severity}; event: ${event}`
    );
  }

  revalidatePath("/order-approval/webstores/");
}
