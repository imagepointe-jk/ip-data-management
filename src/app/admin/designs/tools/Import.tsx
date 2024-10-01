"use client";

import { importDesigns } from "@/actions/designs/misc";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { FormEvent, useState } from "react";

export function Import() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const toast = useToast();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setLoading(true);
    setError(false);

    try {
      await importDesigns(formData);
      toast.toast("Import complete.", "success");
    } catch (error) {
      console.error(error);
      setError(true);
    }

    setLoading(false);
  }

  return (
    <div className="content-frame" style={{ width: "500px" }}>
      <h2>Import Designs</h2>
      <p>
        This is a basic import that accepts a spreadsheet of designs and adds
        them to the database.
      </p>
      <p>
        Currently, importing is only supported for the case where the database
        contains no designs. Attempting to import when designs are already
        present may result in unexpected behavior.{" "}
      </p>
      <form onSubmit={onSubmit} className="vert-flex-group">
        <input type="file" name="sheet" />
        <div>
          <ButtonWithLoading loading={false} normalText="Import" />
        </div>
        {error && (
          <div style={{ color: "red" }}>
            There was an error with the import. Check the console for details.
          </div>
        )}
      </form>
    </div>
  );
}
