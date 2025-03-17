"use client";

import { useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import { NavButtons } from "./NavButtons";

type Props = {
  onClickSubmit: (reason: string, pin: string) => void;
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
  const [pin, setPin] = useState("");
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
          <div>
            <button
              onClick={() => onClickSubmit(text, pin)}
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
          <NavButtons />
        </>
      )}
    </>
  );
}
