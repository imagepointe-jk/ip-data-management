import { NextSearchParams } from "@/types/schema/misc";
import { prisma } from "@/prisma";
import { NavButtons } from "../NavButtonsNEW";
import { DenyForm } from "./DenyForm";

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
              webstore: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (!foundAccessCode) return <>Error: Access code not found.</>;

  const webstore = foundAccessCode.workflowInstance.parentWorkflow.webstore;

  return (
    <>
      <DenyForm requirePin={webstore.requirePinForApproval} />
    </>
  );
}
