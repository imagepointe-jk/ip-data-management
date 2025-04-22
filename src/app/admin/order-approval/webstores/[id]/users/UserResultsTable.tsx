"use client";

import {
  addRoleToUser,
  removeRoleFromUser,
  setUserEmail,
  // setUserIsApprover,
} from "@/actions/orderWorkflow/update";
import GenericTable from "@/components/GenericTable";
import { useToast } from "@/components/ToastProvider";
import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";
import { deduplicateArray } from "@/utility/misc";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

type Props = {
  webstore: Exclude<
    UnwrapPromise<ReturnType<typeof getWebstoreWithIncludes>>,
    null
  >;
};
export function UserResultsTable({ webstore }: Props) {
  const router = useRouter();
  const toast = useToast();
  const sortedUsers = [...webstore.roles.flatMap((role) => role.users)];
  sortedUsers.sort((a, b) => a.id - b.id);
  const uniqueUsers = deduplicateArray(sortedUsers, (user) => user.id);
  // const sortedUsers = [...webstore.userRoles.map((role) => role.user)];
  // sortedUsers.sort((a, b) => a.id - b.id);

  // async function onChangeUserType(
  //   e: ChangeEvent<HTMLSelectElement>,
  //   userId: number
  // ) {
  //   await setUserIsApprover(userId, webstore.id, e.target.value === "approver");
  //   router.refresh();
  //   toast.changesSaved();
  // }

  async function onClickRole(
    userId: number,
    roleId: number,
    operation: "connect" | "disconnect"
  ) {
    try {
      if (operation === "connect") await addRoleToUser(userId, roleId);
      else {
        if (getUserRoleCountWithWebstore(userId) < 2) {
          console.log("Each user must have at least one role.");
          return;
        }
        await removeRoleFromUser(userId, roleId);
      }
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  function getUserRoleCountWithWebstore(userId: number) {
    return webstore.roles.filter(
      (role) => !!role.users.find((user) => user.id === userId)
    ).length;
  }

  return (
    <GenericTable
      dataset={uniqueUsers}
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
          headerName: "Roles",
          createCell: (user) => (
            <>
              {webstore.roles.map((role) => {
                const checked = !!role.users.find(
                  (roleUser) => roleUser.id === user.id
                );
                const disabled =
                  checked && getUserRoleCountWithWebstore(user.id) < 2;
                return (
                  <label
                    key={role.id}
                    style={{ color: disabled ? "#bfbfbf" : undefined }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        onClickRole(
                          user.id,
                          role.id,
                          e.target.checked ? "connect" : "disconnect"
                        )
                      }
                    />
                    {role.name}
                  </label>
                );
              })}
            </>
          ),
        },
        // {
        //   headerName: "Type",
        //   createCell: (user) => (
        //     <select
        //       defaultValue={
        //         webstore.userRoles.find((role) => role.userId === user.id)
        //           ?.role === "approver"
        //           ? "approver"
        //           : "customer"
        //       }
        //       onChange={(e) => onChangeUserType(e, user.id)}
        //     >
        //       <option value="approver">Approver</option>
        //       <option value="customer">Customer</option>
        //     </select>
        //   ),
        // },
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
  const toast = useToast();

  async function onClickSave() {
    await setUserEmail(userId, email);
    setEdited(false);
    toast.changesSaved();
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
