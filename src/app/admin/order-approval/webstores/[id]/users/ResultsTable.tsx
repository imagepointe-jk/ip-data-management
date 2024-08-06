"use client";

import { setUserEmail, setUserIsApprover } from "@/actions/orderWorkflow";
import GenericTable from "@/components/GenericTable";
import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

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
          createCell: (user) => (
            <EditUserEmail initialEmail={user.email} userId={user.id} />
          ),
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

type EditUserEmailProps = {
  userId: number;
  initialEmail: string;
};
function EditUserEmail({ initialEmail, userId }: EditUserEmailProps) {
  const [email, setEmail] = useState(initialEmail);
  const [edited, setEdited] = useState(false);

  async function onClickSave() {
    await setUserEmail(userId, email);
    setEdited(false);
  }

  return (
    <>
      <input
        type="text"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEdited(true);
        }}
      />
      {edited && (
        <button className="button-small" onClick={onClickSave}>
          Save
        </button>
      )}
    </>
  );
}
