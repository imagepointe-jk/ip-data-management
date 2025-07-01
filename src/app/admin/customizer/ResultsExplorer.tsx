"use client";

import { GenericTableExplorer } from "@/components/GenericTableExplorer/GenericTableExplorer";
import { WooCommerceProduct } from "@/types/schema/woocommerce";
import { createWooCommerceProductAdminUrl } from "@/utility/url";
import styles from "@/styles/customizer/CustomizerResultsTable.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
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
  totalRecords: number;
  pageSize: number;
};
export function ResultsExplorer({
  productListings,
  pageSize,
  totalRecords,
}: Props) {
  return (
    <GenericTableExplorer
      dataset={productListings}
      pageSize={pageSize}
      totalRecords={totalRecords}
      className={styles["table"]}
      filteringProps={{
        hideSearch: true,
      }}
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
          headerName: "SKU",
          createCell: (data) => data.product?.sku || "(Unknown SKU)",
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
    />
  );
}
