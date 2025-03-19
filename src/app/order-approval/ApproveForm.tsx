"use client";

import { useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import { NavButtons } from "./NavButtons";

type Props = {
  doApprove: (comments: string | null, pin: string) => void;
  loading: boolean;
  success: boolean;
  error: boolean;
};
export default function ApproveForm({
  loading,
  success,
  doApprove,
  error,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [comments, setComments] = useState("");
  const [pin, setPin] = useState("");

  return (
    <>
      {success && (
        <>
          <h1>Success ✅</h1>
          <p>Approval submitted.</p>
        </>
      )}
      {!success && !loading && (
        <>
          <h1>Approve Order</h1>
          <div className={styles["approval-comments-container"]}>
            <label htmlFor="comments">Comments (optional)</label>
            <div>
              <textarea
                name="comments"
                id="comments"
                cols={40}
                rows={8}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>
          </div>
          <label htmlFor="pin" className={styles["pin-container"]}>
            Enter PIN:{" "}
            <input
              type="text"
              name="pin"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>
          <label htmlFor="approve-acknowledge">
            <input
              type="checkbox"
              name="approve-acknowledge"
              id="approve-acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            I understand that after clicking &quot;Approve Now&quot;, it may not
            be possible to reverse my decision.
          </label>
          <div>
            <button
              onClick={() => doApprove(comments || null, pin)}
              className={styles["approve-button"]}
              disabled={!acknowledged}
            >
              Approve Now
            </button>
          </div>
          {error && (
            <div style={{ color: "red" }}>
              There was an error. Please check your PIN and try again. If the
              problem persists, please contact us.
            </div>
          )}
          <NavButtons />
        </>
      )}
    </>
  );
}
