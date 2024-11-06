"use client";

import { createUserForWebstore } from "@/actions/orderWorkflow/create";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  webstoreId: number;
};
export function CreateUser({ webstoreId }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function onClickAdd() {
    createUserForWebstore(webstoreId, name, email);
    router.refresh();
    setName("");
    setEmail("");
  }

  return (
    <div className="content-frame" style={{ width: "400px" }}>
      <div className="input-group-heading">Add User</div>
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
          <label className="input-label">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <button onClick={onClickAdd}>+ Add User</button>
        </div>
      </div>
    </div>
  );
}
