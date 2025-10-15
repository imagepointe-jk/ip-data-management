import { OrderEditFormStatus } from "./OrderEditForm";
import styles from "@/styles/orderApproval/approverArea/orderEditForm/main.module.css";

type Props = {
  status: OrderEditFormStatus;
  setStatus: (status: OrderEditFormStatus) => void;
};
export function Overlays({ status, setStatus }: Props) {
  function onClickErrorOk() {
    setStatus("idle");
  }

  if (status === "idle") return <></>;
  if (status === "loading")
    return (
      <div className={styles["status-overlay"]}>
        <div>Loading...</div>
      </div>
    );
  if (status === "error")
    return (
      <div className={styles["status-overlay"]}>
        <div>There was an error. Please try again later.</div>

        <button onClick={onClickErrorOk} className={styles["button-primary"]}>
          OK
        </button>
      </div>
    );
}
