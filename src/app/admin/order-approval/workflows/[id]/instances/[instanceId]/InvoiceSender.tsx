"use client";

import { sendInvoiceEmail } from "@/actions/orderWorkflow/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useState } from "react";

type Props = {
  workflowInstanceId: number;
  users: {
    name: string;
    email: string;
  }[];
};
export function InvoiceSender({ workflowInstanceId, users }: Props) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(users[0]?.email || "");
  const [error, setError] = useState(false);
  const toast = useToast();

  async function onClickSend() {
    if (loading) return;

    setError(false);
    setLoading(true);
    try {
      await sendInvoiceEmail(workflowInstanceId, email);
      toast.toast("Invoice sent.", "success");
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setLoading(false);
  }

  return (
    <div className="content-frame vert-flex-group" style={{ width: "400px" }}>
      <h2 style={{ marginTop: "0" }}>Send Invoice</h2>
      <select onChange={(e) => setEmail(e.target.value)}>
        {users.map((user) => (
          <option key={user.email} value={user.email}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
      {error && <div style={{ color: "red" }}>Error sending invoice.</div>}
      <div>
        <ButtonWithLoading
          loading={loading}
          style={{ width: "100px" }}
          onClick={onClickSend}
        >
          Send
        </ButtonWithLoading>
      </div>
    </div>
  );
}
