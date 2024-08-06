"use client";

import { createWorkflow } from "@/actions/orderWorkflow";
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
    <details>
      <summary>Create New Workflow</summary>
      <div>
        Name{" "}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        Webstore
        {webstores.map((webstore) => (
          <div key={webstore.id}>
            <label htmlFor={`webstore-id-${webstore.id}`}>
              <input
                type="radio"
                name="webstore-id"
                id={`webstore-id-${webstore.id}`}
                value={webstore.id}
                onChange={(e) => setWebstoreId(+e.target.value)}
                checked={webstore.id === webstoreId}
              />
              {webstore.name}
            </label>
          </div>
        ))}
      </div>
      <div>
        <button onClick={create}>+ Create</button>
      </div>
    </details>
  );
}
