"use client";

import { createWorkflow } from "@/actions/orderWorkflow/create";
import { Webstore } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  webstores: Webstore[];
};
export function CreateWorkflow({ webstores }: Props) {
  const [name, setName] = useState("");
  const [webstoreId, setWebstoreId] = useState(webstores[0]?.id);
  const router = useRouter();

  async function create() {
    if (!webstoreId || !name) return;

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
              <option key={webstore.id} value={webstore.id}>
                {webstore.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={create}>+ Create</button>
        </div>
      </div>
    </>
  );
}
