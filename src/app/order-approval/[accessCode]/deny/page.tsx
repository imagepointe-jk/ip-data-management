"use client";

import { receiveWorkflowEvent } from "@/actions/orderWorkflow";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const allowSubmit = !!text;
  const params = useParams();

  async function onSubmit() {
    if (!allowSubmit) return;

    try {
      setLoading(true);
      setError(false);
      await receiveWorkflowEvent(`${params.accessCode}`, "deny", text);
      setSuccess(true);
    } catch (error) {
      setError(true);
      console.error(error);
    }
    setLoading(false);
  }

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
          <Link href=".">&lt; Back to Order</Link>
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
                onClick={onSubmit}
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
