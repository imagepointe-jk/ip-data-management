"use client";
import { receiveWorkflowEvent } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import styles from "@/styles/orderApproval/new/approve.module.css";
import { useState } from "react";
import { NavButtons } from "../NavButtonsNEW";

type Props = {
  requirePin: boolean;
};
export function ApproveForm({ requirePin }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [comments, setComments] = useState("");
  const [pin, setPin] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  async function onClickApprove() {
    if (!acknowledged) return;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code") || "";
    setStatus("loading");

    try {
      await receiveWorkflowEvent(code, "approve", comments, pin);
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
          <h1>Success ✅</h1>
          <p>Approval submitted.</p>
        </>
      )}
      {status !== "success" && (
        <>
          <h1>Approve Order</h1>
          <div className={styles["form"]}>
            <div>
              <div>
                <label htmlFor="comments">Comments (optional)</label>
              </div>
              <textarea
                name="comments"
                id="comments"
                cols={40}
                rows={8}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
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
              <label htmlFor="approve-acknowledge">
                <input
                  type="checkbox"
                  name="approve-acknowledge"
                  id="approve-acknowledge"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                I understand that after clicking &quot;Approve Now&quot;, it may
                not be possible to reverse my decision.
              </label>
            </div>
            <div>
              <ButtonWithLoading
                className={styles["approve-button"]}
                loading={status === "loading"}
                style={{ width: "150px" }}
                disabled={!acknowledged}
                onClick={onClickApprove}
              >
                Approve Now
              </ButtonWithLoading>
              {status === "error" && (
                <div style={{ color: "red" }}>
                  There was an error. Please check your PIN and try again. If
                  the problem persists, please contact us.
                </div>
              )}
            </div>
          </div>
          <NavButtons display={{ approve: false }} />
        </>
      )}
    </div>
  );
}
