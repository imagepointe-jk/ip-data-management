"use client";

import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import GenericTable from "@/components/GenericTable";
import { WebstoreUserRole } from "@prisma/client";

type Props = {
  roles: WebstoreUserRole[];
};
export function RoleResultsTable({ roles }: Props) {
  return (
    <GenericTable
      dataset={roles}
      columns={[
        {
          headerName: "Role Name",
          createCell: (data) => <input type="text" />,
        },
        {
          headerName: "",
          createCell: () => (
            <ButtonWithLoading loading={false}>Save</ButtonWithLoading>
          ),
        },
      ]}
    />
  );
}
