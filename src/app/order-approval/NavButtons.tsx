import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import styles from "@/styles/orderApproval/approverArea.module.css";

type Props = {
  beforeApprove?: () => Promise<void>;
};

export function NavButtons({ beforeApprove }: Props) {
  const { parentWindow } = useIframe();

  async function onClickApprove() {
    if (beforeApprove) await beforeApprove();
    parentWindow.setSearchParam("action", "approve");
  }

  return (
    <div className={styles["nav-buttons-container"]}>
      <button
        className={styles["nav-button-review"]}
        onClick={() => parentWindow.setSearchParam("action", null)}
      >
        Review
      </button>
      <button className={styles["nav-button-approve"]} onClick={onClickApprove}>
        Approve
      </button>
      <button
        className={styles["nav-button-deny"]}
        onClick={() => parentWindow.setSearchParam("action", "deny")}
      >
        Deny
      </button>
    </div>
  );
}
