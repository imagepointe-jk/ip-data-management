import styles from "@/styles/orderApproval/approverDashboard/main.module.css";
import "@/styles/orderApproval/approverDashboard/main.css";
import { OrderInstanceRow } from "./OrderInstanceRow";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { prisma } from "@/prisma";
import { PageNavigation } from "@/components/PageNavigation/PageNavigation";
import { NextSearchParams } from "@/types/schema/misc";

type Props = {
  params: Promise<{
    webstoreId: string;
  }>;
  searchParams: NextSearchParams;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const search = await props.searchParams;
  const page = isNaN(+`${search.page}`) ? 1 : +`${search.page}`;
  const webstore = await prisma.webstore.findUnique({
    where: {
      id: +params.webstoreId,
    },
    include: {
      checkoutFields: true,
      roles: {
        include: {
          users: true,
        },
      },
    },
  });
  if (!webstore) return <>Webstore {params.webstoreId} could not be found.</>;

  const workflow = await prisma.orderWorkflow.findFirst({
    where: {
      webstoreId: +params.webstoreId,
    },
    include: {
      steps: {
        include: {
          proceedListeners: true,
        },
      },
    },
  });
  if (!workflow) return <>Webstore {params.webstoreId} has no workflows.</>;

  const pageSize = 10;
  const [instances, allInstances] = await prisma.$transaction([
    prisma.orderWorkflowInstance.findMany({
      where: {
        parentWorkflowId: workflow.id,
      },
      include: {
        accessCodes: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: pageSize * (page - 1),
    }),
    prisma.orderWorkflowInstance.findMany({
      where: {
        parentWorkflowId: workflow.id,
      },
    }),
  ]);

  const totalPages = Math.ceil(allInstances.length / pageSize);

  return (
    <IframeHelperProvider>
      <div className={styles["main"]}>
        <h1>Pending Orders</h1>
        <div>
          <div className={styles["headers-container"]}>
            <div className={`${styles["header"]} ${styles["column-1"]}`}>
              Order ID
            </div>
            <div className={`${styles["header"]} ${styles["column-2"]}`}>
              Date
            </div>
            <div className={`${styles["header"]} ${styles["column-3"]}`}>
              Status
            </div>
            <div className={`${styles["header"]} ${styles["column-4"]}`}></div>
          </div>
          <div className={styles["rows-container"]}>
            {instances.map((instance) => (
              <OrderInstanceRow
                key={instance.id}
                webstore={webstore}
                steps={workflow.steps}
                instance={instance}
                checkoutFields={webstore.checkoutFields}
                roles={webstore.roles}
              />
            ))}
          </div>
          {instances.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              No orders waiting for approval.
            </div>
          )}
        </div>
        <div>
          Viewing page {page} of {totalPages}
        </div>
        <PageNavigation totalPages={totalPages} />
      </div>
    </IframeHelperProvider>
  );
}
