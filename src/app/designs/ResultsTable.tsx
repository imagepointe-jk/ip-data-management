"use client";

import GenericTable from "@/components/GenericTable";
import { DesignWithIncludes } from "@/types/types";
import Link from "next/link";

type Props = {
  designs: DesignWithIncludes[];
};
export default function ResultsTable({ designs }: Props) {
  return (
    <GenericTable
      dataset={designs}
      columns={[
        {
          header: "Image",
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
          createCell: (design) => (
            <Link href={`designs/${design.id}`}>{design.designNumber}</Link>
          ),
        },
        {
          header: "Data 3",
          createCell: () => "Data 3",
        },
        {
          header: "Data 4",
          createCell: () => "Data 4",
        },
      ]}
    />
  );
}
