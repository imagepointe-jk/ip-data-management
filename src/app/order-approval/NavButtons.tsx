"use client";

import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { useRouter } from "next/navigation";

type Props = {
  allowApprove?: boolean;
  display?: {
    approve?: boolean;
    deny?: boolean;
    review?: boolean;
  };
};
export function NavButtons({ allowApprove, display }: Props) {
  const router = useRouter();

  function onClickApprove() {
    if (allowApprove === false) return;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    router.push(
      `${window.location.origin}/order-approval/approve?code=${code}`
    );
  }

  function onClickReview() {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    router.push(`${window.location.origin}/order-approval?code=${code}`);
  }

  function onClickDeny() {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    router.push(`${window.location.origin}/order-approval/deny?code=${code}`);
  }

  return (
    <div className={styles["nav-buttons"]}>
      {display?.review !== false && (
        <button className={styles["review-button"]} onClick={onClickReview}>
          Review
        </button>
      )}
      {display?.approve !== false && (
        <button
          className={`${styles["approve-button"]} ${
            allowApprove === false ? styles["disabled"] : ""
          }`}
          onClick={onClickApprove}
          title={
            allowApprove === false
              ? "Please save your changes before approving."
              : undefined
          }
        >
          Approve
        </button>
      )}
      {display?.deny !== false && (
        <button className={styles["deny-button"]} onClick={onClickDeny}>
          Deny
        </button>
      )}
    </div>
  );
}
