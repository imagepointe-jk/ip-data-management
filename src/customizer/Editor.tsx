"use client";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { ProductView } from "./components/ProductView";
import { Sidebar } from "./components/Sidebar";
import { ArtworkControls } from "./components/ArtworkControls";
import { useSelector } from "react-redux";
import { StoreType } from "./redux/store";

export function Editor() {
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );

  return (
    <div>
      <div className={styles["main"]}>
        <Sidebar />
        <ProductView />
        {selectedEditorGuid && <ArtworkControls />}
      </div>
    </div>
  );
}
