"use client";

import { setUserIsApprover } from "@/actions/orderWorkflow";
import GenericTable from "@/components/GenericTable";
import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

type Props = {
  webstore: Exclude<
    UnwrapPromise<ReturnType<typeof getWebstoreWithIncludes>>,
    null
  >;
};
export function ResultsTable({ webstore }: Props) {
  const router = useRouter();
  const sortedUsers = [...webstore.users];
  sortedUsers.sort((a, b) => a.id - b.id);

  async function onChangeUserType(
    e: ChangeEvent<HTMLSelectElement>,
    userId: number
  ) {
    await setUserIsApprover(userId, e.target.value === "approver");
    router.refresh();
  }

  return (
    <GenericTable
      dataset={sortedUsers}
      columns={[
        {
          headerName: "Name",
          createCell: (user) => user.name,
        },
        {
          headerName: "Email",
          createCell: (user) => user.email,
        },
        {
          headerName: "Type",
          createCell: (user) => (
            <select
              defaultValue={user.isApprover ? "approver" : "customer"}
              onChange={(e) => onChangeUserType(e, user.id)}
            >
              <option value="approver">Approver</option>
              <option value="customer">Customer</option>
            </select>
          ),
        },
      ]}
    />
  );
}
