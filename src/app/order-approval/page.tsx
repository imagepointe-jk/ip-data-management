import styles from "@/styles/orderApproval/new/page.module.css";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { NextSearchParams } from "@/types/schema/misc";
import { prisma } from "@/prisma";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { OrderEditForm } from "./OrderEditForm/OrderEditForm";
import Link from "next/link";
import {
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
} from "@prisma/client";
import { deduplicateArray } from "@/utility/misc";
import { resolveDynamicUserIdentifier } from "@/order-approval/utility";

type Props = {
  searchParams: NextSearchParams;
};
export default async function Page({ searchParams }: Props) {
  const search = await searchParams;
  const code = search.code;
  if (!code || !(typeof code === "string"))
    return <>Error: No access code provided.</>;

  const foundAccessCode = await prisma.orderWorkflowAccessCode.findFirst({
    where: {
      guid: code,
    },
    include: {
      workflowInstance: {
        include: {
          parentWorkflow: {
            include: {
              webstore: {
                include: {
                  shippingMethods: true,
                  shippingSettings: true,
                  checkoutFields: {
                    orderBy: {
                      order: "desc",
                    },
                  },
                },
              },
              steps: {
                include: {
                  proceedListeners: true,
                },
              },
            },
          },
        },
      },
      user: true,
    },
  });

  if (!foundAccessCode) return <>Error: Access code not found.</>;
  const currentStep =
    foundAccessCode.workflowInstance.parentWorkflow.steps.find(
      (step) => step.order === foundAccessCode.workflowInstance.currentStep
    );
  if (!currentStep)
    throw new Error(
      `Current step of workflow ${foundAccessCode.workflowInstance.parentWorkflowId} not found.`
    );
  const waitingOnUserEmails = await resolveWaitingOnUserEmails(
    foundAccessCode.workflowInstance,
    currentStep
  );
  const waitingOnThisUser = waitingOnUserEmails.find(
    (email) =>
      email.toLocaleLowerCase() ===
      foundAccessCode.user.email.toLocaleLowerCase()
  );
  const orderId = foundAccessCode.workflowInstance.wooCommerceOrderId;
  if (!waitingOnThisUser) {
    return (
      <div style={{ textAlign: "center", fontSize: "1.25rem" }}>
        Order {orderId} does not require any action from you at this time.
      </div>
    );
  }

  const webstore = foundAccessCode.workflowInstance.parentWorkflow.webstore;
  const { key, secret } = decryptWebstoreData(webstore);
  const order = await getOrder(orderId, webstore.url, key, secret);
  if (!order.ok) return <>Error: Unable to retrieve order id {orderId}.</>;

  const json = await order.json();
  const parsed = parseWooCommerceOrderJson(json);

  return (
    <>
      <div className={styles["info-text"]}>
        Please review the following order and make changes if needed. Once
        finished, please save your changes and then approve or deny the order.
      </div>
      <OrderEditForm
        order={parsed}
        storeUrl={webstore.url}
        userEmail={foundAccessCode.user.email}
        allowHelpRequest={webstore.allowOrderHelpRequest}
        shippingMethods={webstore.shippingMethods}
        checkoutFields={
          foundAccessCode.workflowInstance.parentWorkflow.webstore
            .checkoutFields
        }
      />
      <div className={styles["nav-buttons"]}>
        <Link href="/approve"></Link>
        <Link href="/deny"></Link>
      </div>
    </>
  );
}

async function resolveWaitingOnUserEmails(
  instance: OrderWorkflowInstance,
  step: OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  }
) {
  const allFromValues = step.proceedListeners.map((listener) => listener.from);
  const deduplicated = deduplicateArray(allFromValues, (val) => val);
  const emails: string[] = [];
  for (const from of deduplicated) {
    const resolved =
      (await resolveDynamicUserIdentifier(from, instance)) || "EMAIL_NOT_FOUND";
    emails.push(resolved);
  }
  return emails;
}
