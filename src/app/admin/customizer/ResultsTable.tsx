"use client";

import GenericTable from "@/components/GenericTable";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { WooCommerceProduct } from "@/types/schema";
import styles from "@/styles/customizer/CustomizerResultsTable.module.css";
import { createWooCommerceProductAdminUrl } from "@/utility/url";
import Link from "next/link";

type Props = {
  productListings: {
    product?: WooCommerceProduct;
    id: number;
    variations: {
      views: {
        imageUrl: string;
      }[];
    }[];
  }[];
};
export default function ResultsTable({ productListings }: Props) {
  return (
    <GenericTable
      className={styles["table"]}
      columns={[
        {
          headerName: "Image",
          createCell: (data) => (
            <img
              className={styles["product-img"]}
              src={
                data.variations[0]?.views[0]?.imageUrl || IMAGE_NOT_FOUND_URL
              }
            />
          ),
        },
        {
          headerName: "Product Name",
          createCell: (data) =>
            data.product ? (
              <Link href={`customizer/${data.id}`}>{data.product.name}</Link>
            ) : (
              "(Product not found)"
            ),
        },
        {
          headerName: "WooCommerce Product",
          createCell: (data) =>
            data.product ? (
              <a href={createWooCommerceProductAdminUrl(data.product.id)}>
                Edit Product
              </a>
            ) : (
              "(Product not found)"
            ),
        },
        {
          headerName: "Variations",
          createCell: (data) => data.variations.length,
        },
      ]}
      dataset={productListings}
    />
  );
}
