"use client";

import { createUserForWebstore } from "@/actions/orderWorkflow";
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
    <details className="content-frame" style={{ width: "400px" }}>
      <summary>Add User</summary>
      <div>
        Name{" "}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        Email{" "}
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <button onClick={onClickAdd}>+ Add User</button>
      </div>
    </details>
  );
}
