import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useEditor } from "../EditorContext";

export function ArtworkControls() {
  const { deleteArtworkFromState, selectedEditorGuid } = useEditor();

  if (!selectedEditorGuid) return <></>;

  return (
    <div
      className={`${styles["floating-container"]} ${styles["artwork-controls-bar"]}`}
    >
      <button onClick={() => deleteArtworkFromState(selectedEditorGuid)}>
        Delete
      </button>
    </div>
  );
}
