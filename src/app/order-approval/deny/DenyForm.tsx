"use client";
import { receiveWorkflowEvent } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import styles from "@/styles/orderApproval/new/deny.module.css";
import { useState } from "react";
import { NavButtons } from "../NavButtons";

type Props = {
  requirePin: boolean;
};
export function DenyForm({ requirePin }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");

  async function onClickDeny() {
    if (!reason) return;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code") || "";
    setStatus("loading");

    try {
      await receiveWorkflowEvent(code, "deny", reason, pin);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <div className={styles["main"]}>
      {status === "success" && (
        <>
          <h1>Success</h1>
          <p>The order has been denied.</p>
        </>
      )}
      {status !== "success" && (
        <>
          <h1>Deny Order</h1>
          <div className={styles["form"]}>
            <div>
              You are about to <strong>deny</strong> this order. Please give a
              reason before continuing.
            </div>
            <div>
              <textarea
                cols={40}
                rows={8}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>
            {requirePin && (
              <div>
                <label htmlFor="pin">
                  Enter PIN:{" "}
                  <input
                    type="text"
                    name="pin"
                    id="pin"
                    className={styles["pin"]}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </label>
              </div>
            )}
            <div>
              <ButtonWithLoading
                className={styles["deny-button"]}
                loading={status === "loading"}
                style={{ width: "150px" }}
                disabled={!reason}
                onClick={onClickDeny}
              >
                Deny Order
              </ButtonWithLoading>
              {status === "error" && (
                <div style={{ color: "red" }}>
                  There was an error. Please check your PIN and try again. If
                  the problem persists, please contact us.
                </div>
              )}
            </div>
          </div>
          <NavButtons display={{ deny: false }} />
        </>
      )}
    </div>
  );
}
