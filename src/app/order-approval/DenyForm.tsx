"use client";

import { useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";

type Props = {
  onClickSubmit: (reason: string) => void;
  loading: boolean;
  success: boolean;
  error: boolean;
};
export default function DenyForm({
  loading,
  success,
  onClickSubmit,
  error,
}: Props) {
  const [text, setText] = useState("");
  const allowSubmit = !!text;

  return (
    <>
      {success && (
        <>
          <h1>Success</h1>
          <p>The order has been denied.</p>
        </>
      )}
      {!success && !loading && (
        <>
          <h1>Deny Order</h1>
          <div>
            You are about to <strong>deny</strong> this order. Please give a
            reason before continuing.
          </div>
          <textarea
            className={styles["deny-textarea"]}
            cols={40}
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <div>
            <button
              onClick={() => onClickSubmit(text)}
              className={styles["deny-button"]}
              disabled={!allowSubmit}
            >
              Deny Order
            </button>
          </div>
          {error && (
            <div style={{ color: "red" }}>
              There was an error. Please contact us.
            </div>
          )}
        </>
      )}
    </>
  );
}
