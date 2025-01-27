"use client";

import { exportDASearches } from "@/actions/tracking/tracking";
import { FormEvent, useState } from "react";

export function ExportForm() {
  const [status, setStatus] = useState(
    "idle" as "idle" | "loading" | "error" | "success"
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email");
    if (!email) return;

    try {
      setStatus("loading");
      await exportDASearches(`${email}`);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "600px" }}
    >
      <h2>Export All Searches</h2>
      <div>Enter the email address the export should be sent to:</div>
      <div>
        <input type="email" name="email" id="email" />
      </div>
      <div>
        {status === "idle" && <button type="submit">Export</button>}
        {status === "loading" && <>Exporting...</>}
        {status === "error" && <>Export error.</>}
        {status === "success" && <>Export successful.</>}
      </div>
    </form>
  );
}
