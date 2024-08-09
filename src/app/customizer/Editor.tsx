"use client";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { Sidebar } from "./components/Sidebar";

type Props = {
  customProductId: number;
};
export function Editor({ customProductId }: Props) {
  return (
    <div className={styles["main"]}>
      <Sidebar />
    </div>
  );
}
