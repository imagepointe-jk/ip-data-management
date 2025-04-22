"use client";

import { WebstoreUserRole } from "@prisma/client";
import { SingleRole } from "./SingleRole";
import { useState } from "react";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useRouter } from "next/navigation";
import { createRole } from "@/actions/orderWorkflow/create";

type Props = {
  roles: WebstoreUserRole[];
  webstoreId: number;
};
export function Roles({ roles, webstoreId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sortedRoles = [...roles];
  sortedRoles.sort((a, b) => a.id - b.id);

  async function onClickAdd() {
    setLoading(true);
    try {
      await createRole(webstoreId);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sortedRoles.map((role) => (
        <SingleRole key={role.id} role={role} />
      ))}
      <div>
        <ButtonWithLoading
          loading={loading}
          normalText="+ Add Role"
          onClick={onClickAdd}
        />
      </div>
    </div>
  );
}
