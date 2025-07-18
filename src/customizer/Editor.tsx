"use client";
import styles from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { ProductView } from "./components/ProductView";
import { Sidebar } from "./components/Sidebar";
import { ArtworkControls } from "./components/ArtworkControls";
import { useSelector } from "react-redux";
import { StoreType } from "./redux/store";
import { CartBar } from "./components/CartBar";
import { CartModal } from "./components/cart/CartModal";
import { ViewControls } from "./components/ViewControls";
import "@/styles/customizer/CustomProductDesigner/main.css";
import { StartOverModal } from "./components/StartOverModal";
import { CopyDesignModal } from "./components/copyDesign/CopyDesignModal";
import { HelpModal } from "./components/HelpModal";
import { GlobalLoading } from "./components/GlobalLoading";

export function Editor() {
  const openModal = useSelector(
    (store: StoreType) => store.editorState.modalOpen
  );
  const globalLoading = useSelector(
    (store: StoreType) => store.editorState.globalLoading
  );

  return (
    <div>
      <div className={styles["main"]}>
        <Sidebar />
        <ProductView />
        <CartBar />
        <ViewControls />
        {openModal === "cart" && <CartModal />}
        {openModal === "start over" && <StartOverModal />}
        {openModal === "copy design" && <CopyDesignModal />}
        {openModal === "help" && <HelpModal />}
        <ArtworkControls />
        {globalLoading.loading && <GlobalLoading />}
      </div>
    </div>
  );
}
