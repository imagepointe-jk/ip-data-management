"use client";

import { createWorkflow } from "@/actions/orderWorkflow/create";
import { Webstore } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  webstores: {
    data: Webstore;
    hasWorkflow: boolean;
  }[];
};
export function CreateWorkflow({ webstores }: Props) {
  const [name, setName] = useState("");
  const [webstoreId, setWebstoreId] = useState(webstores[0]?.data.id);
  const router = useRouter();
  const selectedWebstoreHasWorkflow =
    webstores.find((webstore) => webstore.data.id === webstoreId)
      ?.hasWorkflow || false;

  async function create() {
    if (!webstoreId || !name || selectedWebstoreHasWorkflow) return;

    await createWorkflow(webstoreId, name);
    router.refresh();
  }

  return (
    <>
      <div className="input-group-heading">Create New Workflow</div>
      <div className="vert-flex-group">
        <div>
          <label className="input-label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="input-label">Webstore</label>
          <select
            name="webstore-select"
            onChange={(e) => setWebstoreId(+e.target.value)}
            defaultValue={webstoreId}
          >
            {webstores.map((webstore) => (
              <option key={webstore.data.id} value={webstore.data.id}>
                {webstore.data.name}
              </option>
            ))}
          </select>
        </div>
        {selectedWebstoreHasWorkflow && (
          <div style={{ color: "red" }}>
            This webstore already has a workflow.
          </div>
        )}
        <div>
          <button disabled={selectedWebstoreHasWorkflow} onClick={create}>
            + Create
          </button>
        </div>
      </div>
    </>
  );
}
