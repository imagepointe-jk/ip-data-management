"use client";

import { uploadTaxData } from "@/actions/tax/tax";
import { useToast } from "@/components/ToastProvider";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const [status, setStatus] = useState(
    "idle" as "idle" | "loading" | "error" | "success"
  );
  const toast = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setStatus("loading");
    try {
      const result = await uploadTaxData(formData);
      setStatus("success");
      toast.toast("Data uploaded. Import process started.", "success");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <form
      className="content-frame vert-flex-group"
      style={{ marginTop: "20px", width: "800px" }}
      onSubmit={onSubmit}
    >
      <h3>Upload Import Spreadsheet</h3>
      <label htmlFor="url">
        Store URL
        <input type="text" name="url" id="url" style={{ width: "500px" }} />
      </label>
      <label htmlFor="key">
        Store Key
        <input type="text" name="key" id="key" style={{ width: "500px" }} />
      </label>
      <label htmlFor="secret">
        Store Secret
        <input
          type="text"
          name="secret"
          id="secret"
          style={{ width: "500px" }}
        />
      </label>
      <label htmlFor="file">
        <input type="file" name="file" id="file" />
      </label>
      <div>
        {status !== "loading" && <button type="submit">Upload</button>}
        {status === "loading" && <div>Loading...</div>}
        {status === "error" && (
          <div style={{ color: "red" }}>
            Error uploading data. See console for details.
          </div>
        )}
        {status === "success" && <div></div>}
      </div>
    </form>
  );
}
