"use client";

import { useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import { NavButtons } from "./NavButtons";

type Props = {
  doApprove: () => void;
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
          <label htmlFor="approve-acknowledge">
            <input
              type="checkbox"
              name="approve-acknowledge"
              id="approve-acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            I understand that by after clicking &quot;Approve&quot;, it may not
            be possible to reverse my decision.
          </label>
          <div>
            <button
              onClick={doApprove}
              className={styles["approve-button"]}
              disabled={!acknowledged}
            >
              Approve Now
            </button>
          </div>
          {error && (
            <div style={{ color: "red" }}>
              There was an error. Please contact us.
            </div>
          )}
          <NavButtons />
        </>
      )}
    </>
  );
}
