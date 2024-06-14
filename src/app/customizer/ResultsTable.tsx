"use client";

import GenericTable from "@/components/GenericTable";
import { WooCommerceProduct } from "@/types/schema";
import { CustomGarmentSettings } from "@prisma/client";

type Props = {
  garmentSettings: (CustomGarmentSettings & { product?: WooCommerceProduct })[];
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
          header: "Product Name",
          createCell: (data) =>
            data.product ? data.product.name : "(Product not found)",
        },
      ]}
      dataset={garmentSettings}
    />
  );
}
