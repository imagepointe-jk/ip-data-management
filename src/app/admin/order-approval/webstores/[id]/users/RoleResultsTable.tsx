"use client";

import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import GenericTable from "@/components/GenericTable";

type Props = {
  roles: {
    id: number;
  }[];
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
