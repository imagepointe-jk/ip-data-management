import styles from "@/styles/orderApproval/approverDashboard.module.css";
import { OrderInstanceRow } from "./OrderInstanceRow";
import { TEMP_getWebstore } from "./TEMP_DATA";
import { notFound } from "next/navigation";

type Props = {
  params: {
    webstoreId: string;
  };
};
export default async function Page({ params }: Props) {
  const webstore = await TEMP_getWebstore(+params.webstoreId);
  if (!webstore) notFound();

  const workflow = webstore.workflows[0];
  if (!workflow) notFound();

  return (
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
              steps={workflow.steps}
              instance={instance}
              checkoutFields={webstore.checkoutFields}
              roles={webstore.roles}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
