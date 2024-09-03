"use client";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { ProductView } from "./components/ProductView";
import { Sidebar } from "./components/Sidebar";
import { ArtworkControls } from "./components/ArtworkControls";
import { useSelector } from "react-redux";
import { StoreType } from "./redux/store";
import { CartBar } from "./components/CartBar";
import { CartModal } from "./components/CartModal";

export function Editor() {
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const openModal = useSelector(
    (store: StoreType) => store.editorState.modalOpen
  );

  return (
    <div>
      <div className={styles["main"]}>
        <Sidebar />
        <ProductView />
        <CartBar />
        {openModal === "cart" && <CartModal />}
        {selectedEditorGuid && <ArtworkControls />}
      </div>
    </div>
  );
}
