"use client";

import { deleteDesign } from "@/actions/designs";
import { Design } from "@prisma/client";
import { useState } from "react";

type Props = {
  design: Design;
};
export default function DesignDelete({ design }: Props) {
  const [checked, setChecked] = useState(false);

  async function clickDeleteDesign() {
    if (!checked) return;

    try {
      await deleteDesign(design.id);
    } catch (error) {
      console.error("Error deleting design", error);
    }
  }

  return (
    <div className="content-frame" style={{ width: "300px;" }}>
      <details>
        <summary>Danger Zone</summary>
        <div>
          This will DELETE design {design.designNumber} PERMANENTLY. Please
          check the box below to confirm.
        </div>
        <div>
          <label htmlFor="confirm">
            <input
              type="checkbox"
              name="confirm"
              id="confirm"
              onChange={(e) => setChecked(e.target.checked)}
            />
            Delete permanently
          </label>
        </div>
        <div>
          <button
            className="button-danger"
            onClick={clickDeleteDesign}
            disabled={!checked}
          >
            Delete
          </button>
        </div>
      </details>
    </div>
  );
}
