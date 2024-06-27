"use client";

import GenericTable from "@/components/GenericTable";
import { DesignWithIncludes } from "@/types/types";
import Link from "next/link";
import styles from "../../styles/designs.module.css";

//TODO: Fix broken design updating due to design number type switch
type Props = {
  designs: DesignWithIncludes[];
};
export default function ResultsTable({ designs }: Props) {
  return (
    <GenericTable
      className={styles["design-table"]}
      dataset={designs}
      columns={[
        {
          header: "Image",
          className: styles["img-column"],
          createCell: (data) => (
            <div style={{ height: "50px", width: "50px" }}>
              <img
                style={{
                  height: "100%",
                  backgroundColor: `#${data.defaultBackgroundColor.hexCode}`,
                }}
                src={data.imageUrl}
              />
            </div>
          ),
        },
        {
          header: "Design Number",
          className: styles["main-column"],
          createCell: (design) => (
            <Link href={`designs/${design.id}`}>{design.designNumber}</Link>
          ),
        },
        {
          header: "Status",
          createCell: (design) => (
            <span
              className={
                design.status === "Published"
                  ? styles["published"]
                  : styles["draft"]
              }
            >
              {design.status}
            </span>
          ),
        },
        {
          header: "Featured",
          createCell: (design) => (design.featured ? "✅" : "❌"),
        },
        {
          header: "Design Date",
          createCell: (design) => design.date.toLocaleDateString(),
        },
      ]}
    />
  );
}
