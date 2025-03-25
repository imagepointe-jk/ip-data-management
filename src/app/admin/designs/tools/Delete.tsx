"use client";

import { deleteAllDesignsPermanently } from "@/actions/designs/delete";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useToast } from "@/components/ToastProvider";
import { useState } from "react";

const safetyString = "delete all designs";

export function Delete() {
  const [text, setText] = useState("");
  const safetyStringMatch = text === safetyString;
  const toast = useToast();

  async function onClickDelete() {
    if (!safetyStringMatch) return;

    await deleteAllDesignsPermanently();
    toast.toast("All designs deleted.", "success");
  }

  return (
    <div className="content-frame" style={{ width: "500px" }}>
      <h2>Delete All Designs</h2>
      <p>
        This will PERMANENTLY delete all designs and their variations from this
        database.
      </p>
      <p>
        Type &quot;{safetyString}&quot; and then click the button to perform
        this action.
      </p>
      <div className="vert-flex-group">
        <input
          type="text"
          placeholder={safetyString}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <ButtonWithLoading
            loading={false}
            className="button-danger"
            normalText="DELETE ALL DESIGNS"
            onClick={onClickDelete}
            disabled={!safetyStringMatch}
          />
        </div>
      </div>
    </div>
  );
}
