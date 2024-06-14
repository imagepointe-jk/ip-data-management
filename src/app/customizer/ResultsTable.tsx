"use client";

import GenericTable from "@/components/GenericTable";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { GarmentSettingListing } from "@/db/access/customizer";
import { WooCommerceProduct } from "@/types/schema";
import { CustomGarmentSettings } from "@prisma/client";
import styles from "../../styles/CustomizerResultsTable.module.css";

type Props = {
  garmentListings: (GarmentSettingListing & { product?: WooCommerceProduct })[];
};
export default function ResultsTable({ garmentListings }: Props) {
  return (
    <GenericTable
      columns={[
        {
          header: "Image",
          createCell: (data) => (
            <img
              className={styles["garment-img"]}
              src={data.imageUrl ? data.imageUrl : IMAGE_NOT_FOUND_URL}
            />
          ),
        },
        {
          header: "Product Name",
          createCell: (data) =>
            data.product ? data.product.name : "(Product not found)",
        },
      ]}
      dataset={garmentListings}
    />
  );
}
