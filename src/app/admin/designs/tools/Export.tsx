"use client";

import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useState } from "react";

export function Export() {
  const [email, setEmail] = useState("");
  const toast = useToast();

  async function onClickExport() {
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
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <ButtonWithLoading
            loading={false}
            normalText="Export"
            onClick={onClickExport}
          />
        </div>
      </div>
    </div>
  );
}
