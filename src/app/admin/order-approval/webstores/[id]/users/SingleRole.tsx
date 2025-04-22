"use client";

import { deleteRole } from "@/actions/orderWorkflow/delete";
import { updateRole } from "@/actions/orderWorkflow/update";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { WebstoreUserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  role: WebstoreUserRole;
};
export function SingleRole({ role }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(role.name);
  const router = useRouter();

  async function onClickSave() {
    setLoading(true);
    try {
      await updateRole(role.id, name);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function onClickDelete() {
    try {
      await deleteRole(role.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {"  "}
      <ButtonWithLoading
        loading={loading}
        normalText="Save"
        onClick={onClickSave}
      />
      {"  "}
      <button className="button-danger" onClick={onClickDelete}>
        Delete
      </button>
    </div>
  );
}
