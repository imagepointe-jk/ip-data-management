"use client";

import { exportAndSend } from "@/actions/designs/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useState } from "react";

export function Export() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onClickExport() {
    setLoading(true);
    await exportAndSend(email);
    setLoading(false);
    toast.toast(`Export sent to ${email}.`, "success");
  }

  return (
    <div className="content-frame" style={{ width: "500px" }}>
      <h2>Export Designs</h2>
      <p>
        This will export the designs in the database to a spreadsheet, then
        email the spreadsheet to the given email address.
      </p>
      <div className="vert-flex-group">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <ButtonWithLoading
            loading={loading}
            normalText="Export"
            onClick={onClickExport}
          />
        </div>
      </div>
    </div>
  );
}
