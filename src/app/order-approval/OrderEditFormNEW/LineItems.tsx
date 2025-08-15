import styles from "@/styles/orderApproval/new/orderEditForm/lineItems.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function LineItems() {
  return (
    <div className={styles["main"]}>
      <div className={styles["fake-table-header-row"]}>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-1"]}`}
        ></div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-2"]}`}
        >
          Name
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-3"]}`}
        >
          Quantity
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-4"]}`}
        >
          Unit Price
        </div>
        <div
          className={`${styles["fake-table-header"]} ${styles["fake-table-column-5"]}`}
        >
          Amount
        </div>
      </div>
      <div className={styles["fake-table-row"]}>
        <div
          className={`${styles["fake-table-cell"]} ${styles["fake-table-column-1"]}`}
        >
          <button>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div
          className={`${styles["fake-table-cell"]} ${styles["fake-table-column-2"]}`}
        >
          Test 2 - Test
        </div>
        <div
          className={`${styles["fake-table-cell"]} ${styles["fake-table-column-3"]}`}
        >
          <input type="number" />
        </div>
        <div
          className={`${styles["fake-table-cell"]} ${styles["fake-table-column-4"]}`}
        >
          {" "}
          $100.00{" "}
        </div>
        <div
          className={`${styles["fake-table-cell"]} ${styles["fake-table-column-5"]}`}
        >
          {" "}
          $100.00{" "}
        </div>
      </div>
    </div>
  );
}
