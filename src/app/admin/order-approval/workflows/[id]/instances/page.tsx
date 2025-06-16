import { ResultsExplorer } from "./ResultsExplorer";
import Link from "next/link";
import { ManualInstanceTrigger } from "./ManualInstanceTrigger";
import { prisma } from "@/prisma";
import { NextSearchParams } from "@/types/schema/misc";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: NextSearchParams;
};
export default async function Page({ params, searchParams }: Props) {
  const workflowId = (await params).id;
  const search = await searchParams;
  const pageSize = 20;
  const page = isNaN(+`${search.page}`) ? 1 : +`${search.page}`;

  const [workflowWithInstances, allInstances] = await prisma.$transaction([
    prisma.orderWorkflow.findUnique({
      where: {
        id: +workflowId,
      },
      include: {
        steps: {
          include: {
            proceedListeners: true,
          },
        },
        instances: {
          orderBy: {
            createdAt: "desc",
          },
          take: pageSize,
          skip: pageSize * (page - 1),
        },
        webstore: {
          include: {
            roles: {
              include: {
                users: true,
              },
            },
            checkoutFields: true,
          },
        },
      },
    }),
    prisma.orderWorkflowInstance.findMany({
      where: {
        parentWorkflowId: +workflowId,
      },
    }),
  ]);
  if (!workflowWithInstances) return <h1>Workflow {workflowId} not found.</h1>;

  return (
    <>
      <h1>Instances of {workflowWithInstances.name}</h1>
      <Link
        href={`../${workflowWithInstances.id}`}
      >{`< Back to ${workflowWithInstances.name}`}</Link>
      <ResultsExplorer
        workflow={workflowWithInstances}
        pageSize={pageSize}
        totalInstances={allInstances.length}
      />
      <div
        className="content-frame"
        style={{ width: "400px", marginTop: "20px" }}
      >
        <ManualInstanceTrigger webstore={workflowWithInstances.webstore} />
      </div>
    </>
  );
}
