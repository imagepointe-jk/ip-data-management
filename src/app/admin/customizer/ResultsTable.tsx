"use client";

import GenericTable from "@/components/GenericTable";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { ProductSettingListing } from "@/db/access/customizer";
import { WooCommerceProduct } from "@/types/schema";
import styles from "@/styles/CustomizerResultsTable.module.css";

type Props = {
  productListings: (ProductSettingListing & { product?: WooCommerceProduct })[];
};
export default function ResultsTable({ productListings }: Props) {
  return (
    <GenericTable
      columns={[
        {
          headerName: "Image",
          createCell: (data) => (
            <img
              className={styles["product-img"]}
              src={data.imageUrl ? data.imageUrl : IMAGE_NOT_FOUND_URL}
            />
          ),
        },
        {
          headerName: "Product Name",
          createCell: (data) =>
            data.product ? data.product.name : "(Product not found)",
        },
      ]}
      dataset={productListings}
    />
  );
}
