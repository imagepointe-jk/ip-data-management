import styles from "@/styles/orderApproval/approverDashboard.module.css";
import { OrderInstanceRow } from "./OrderInstanceRow";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { prisma } from "@/prisma";

type Props = {
  params: Promise<{
    webstoreId: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const webstore = await prisma.webstore.findUnique({
    where: {
      id: +params.webstoreId,
    },
    include: {
      workflows: {
        include: {
          instances: {
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
            where: {
              status: {
                not: "finished",
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
      checkoutFields: true,
      roles: {
        include: {
          users: true,
        },
      },
    },
  });
  if (!webstore) return <>Webstore {params.webstoreId} could not be found.</>;

  const workflow = webstore.workflows[0];
  if (!workflow) return <>Webstore {params.webstoreId} has no workflows.</>;

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
            {workflow.instances.map((instance) => (
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
          {workflow.instances.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              No orders waiting for approval.
            </div>
          )}
        </div>
      </div>
    </IframeHelperProvider>
  );
}
