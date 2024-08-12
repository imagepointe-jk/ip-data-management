"use client";
import { populateProductData } from "@/customizer/handleData";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { DesignResults, UnwrapPromise } from "@/types/types";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";
import { ProductView } from "./components/ProductView";

export type EditorProps = {
  initialProductId: number;
  designs: DesignResults;
  productData: UnwrapPromise<ReturnType<typeof populateProductData>>;
};
export function Editor({
  productData,
  designs,
  initialProductId,
}: EditorProps) {
  const initialProductData = productData.find(
    (data) => data.wooCommerceId === initialProductId
  );
  const initialVariation = initialProductData?.variations[0];
  const initialView = initialVariation?.views[0];

  const [variation, setVariation] = useState(initialVariation);
  const [view, setView] = useState(initialView);

  return (
    <div className={styles["main"]}>
      <Sidebar />
      <ProductView imageUrl={view?.imageUrl} />
    </div>
  );
}
