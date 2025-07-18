import { LoadingIndicator } from "@/components/LoadingIndicator";
import styles from "@/styles/customizer/CustomProductDesigner/globalLoading.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";

export function GlobalLoading() {
  const globalLoading = useSelector(
    (store: StoreType) => store.editorState.globalLoading
  );

  return (
    <div className={styles["main"]}>
      <div className={styles["indicator-container"]}>
        <LoadingIndicator style={{ filter: "none" }} />
        <div>Loading...</div>
      </div>
      {globalLoading.progress !== null && (
        <div className={styles["loading-bar-bg"]}>
          <div
            className={styles["loading-bar"]}
            style={{ right: `${100 - globalLoading.progress * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
