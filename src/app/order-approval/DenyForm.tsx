"use client";

import { useState } from "react";

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
      {!success && (
        <>
          <h1>Deny Order</h1>
          <div>
            You are about to <strong>deny</strong> this order. Please give a
            reason before continuing.
          </div>
          <textarea
            cols={40}
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <div>
            {!loading && (
              <button
                onClick={() => onClickSubmit(text)}
                style={{
                  backgroundColor: allowSubmit ? "red" : "lightgray",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  color: "white",
                  cursor: allowSubmit ? "pointer" : undefined,
                }}
                disabled={!allowSubmit}
              >
                Deny Order
              </button>
            )}
            {loading && <div>Loading...</div>}
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
