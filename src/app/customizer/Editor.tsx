"use client";
import { populateProductData } from "@/customizer/handleData";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { DesignResults, UnwrapPromise } from "@/types/types";
import { Sidebar } from "./components/Sidebar";

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
  return (
    <div className={styles["main"]}>
      <Sidebar />
    </div>
  );
}
