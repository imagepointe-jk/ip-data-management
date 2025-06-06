import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import styles from "@/styles/orderApproval/approverArea.module.css";

type Props = {
  modifiedByUser?: boolean;
};

export function NavButtons({ modifiedByUser }: Props) {
  const { parentWindow } = useIframe();
  const searchParams = new URLSearchParams(parentWindow.location?.search);
  const action = searchParams.get("action");

  async function onClickApprove() {
    if (!modifiedByUser) parentWindow.setSearchParam("action", "approve");
  }

  return (
    <div className={styles["nav-buttons-container"]}>
      {action !== null && (
        <button
          className={styles["nav-button-review"]}
          onClick={() => parentWindow.setSearchParam("action", null)}
        >
          Review
        </button>
      )}
      {action !== "approve" && (
        <button
          className={styles["nav-button-approve"]}
          onClick={onClickApprove}
          disabled={modifiedByUser}
          title={
            modifiedByUser
              ? "Please save your changes before approving."
              : undefined
          }
        >
          Approve
        </button>
      )}
      {action !== "deny" && (
        <button
          className={styles["nav-button-deny"]}
          onClick={() => parentWindow.setSearchParam("action", "deny")}
        >
          Deny
        </button>
      )}
    </div>
  );
}
