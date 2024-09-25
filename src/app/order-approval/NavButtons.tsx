import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import styles from "@/styles/orderApproval/approverArea.module.css";

type Props = {
  beforeApproveNow: () => Promise<void>;
};

export function NavButtons({ beforeApproveNow }: Props) {
  const { parentWindow } = useIframe();

  async function onClickApproveNow() {
    await beforeApproveNow();
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
      <button
        className={styles["nav-button-approve"]}
        onClick={onClickApproveNow}
      >
        Approve Now
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
