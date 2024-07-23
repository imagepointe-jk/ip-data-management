"use client";

import GenericTable from "@/components/GenericTable";
import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/types";

type Props = {
  webstore: Exclude<
    UnwrapPromise<ReturnType<typeof getWebstoreWithIncludes>>,
    null
  >;
};
export function ResultsTable({ webstore }: Props) {
  return (
    <GenericTable
      dataset={webstore.users}
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
          createCell: (user) => (user.isApprover ? "Approver" : "Customer"),
        },
      ]}
    />
  );
}
