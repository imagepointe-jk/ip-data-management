import styles from "@/styles/orderApproval/approverDashboard.module.css";
import { OrderInstanceRow } from "./OrderInstanceRow";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../prisma/client";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";

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
  if (!webstore) notFound();

  const workflow = webstore.workflows[0];
  if (!workflow) notFound();

  return (
    <IframeHelperProvider>
      <div className={styles["main"]}>
        <h1>Dashboard for webstore {params.webstoreId}</h1>
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
        </div>
      </div>
    </IframeHelperProvider>
  );
}
