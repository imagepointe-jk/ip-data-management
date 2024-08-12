"use client";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { ProductView } from "./components/ProductView";
import { Sidebar } from "./components/Sidebar";

export function Editor() {
  return (
    <div>
      <div className={styles["main"]}>
        <Sidebar />
        <ProductView />
      </div>
    </div>
  );
}
