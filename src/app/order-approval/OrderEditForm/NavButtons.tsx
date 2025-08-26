"use client";

import styles from "@/styles/orderApproval/new/orderEditForm/main.module.css";
import { useRouter } from "next/navigation";

type Props = {
  allowApprove: boolean;
};
export function NavButtons({ allowApprove }: Props) {
  const router = useRouter();

  function onClickApprove() {
    if (!allowApprove) return;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    router.push(
      `${window.location.origin}/order-approval/approve?code=${code}`
    );
  }

  function onClickDeny() {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    router.push(`${window.location.origin}/order-approval/deny?code=${code}`);
  }

  return (
    <div className={styles["nav-buttons"]}>
      <button
        className={`${styles["approve-button"]} ${
          !allowApprove ? styles["disabled"] : ""
        }`}
        onClick={onClickApprove}
        title={
          !allowApprove
            ? "Please save your changes before approving."
            : undefined
        }
      >
        Approve
      </button>
      <button className={styles["deny-button"]} onClick={onClickDeny}>
        Deny
      </button>
    </div>
  );
}
