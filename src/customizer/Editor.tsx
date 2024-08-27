"use client";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { ProductView } from "./components/ProductView";
import { Sidebar } from "./components/Sidebar";
import { useEditor } from "./EditorContext";
import { ArtworkControls } from "./components/ArtworkControls";

export function Editor() {
  const { selectedEditorGuid } = useEditor();

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
