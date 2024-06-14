"use client";

import GenericTable from "@/components/GenericTable";
import { CustomGarmentSettings } from "@prisma/client";

type Props = {
  garmentSettings: CustomGarmentSettings[];
};
export default function ResultsTable({ garmentSettings }: Props) {
  return (
    <GenericTable
      columns={[
        {
          header: "ID",
          createCell: (data) => data.id,
        },
        {
          header: "WooCommerce ID",
          createCell: (data) => data.wooCommerceId,
        },
      ]}
      dataset={garmentSettings}
    />
  );
}
