"use client";

import { ButtonWithLoading } from "@/components/ButtonWithLoading";

export function Import() {
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
      <div className="vert-flex-group">
        <input type="file" />
        <div>
          <ButtonWithLoading loading={false} normalText="Import" />
        </div>
      </div>
    </div>
  );
}
