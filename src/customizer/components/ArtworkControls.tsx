import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useEditor } from "../EditorContext";

export function ArtworkControls() {
  const { deleteArtworkFromState, selectedEditorGuid } = useEditor();

  if (!selectedEditorGuid) return <></>;
  //   const selectedObject = designState.artworks.find(
  //     (artwork) => artwork.objectData.editorGuid === selectedEditorGuid
  //   );
  //   const value = selectedObject?.objectData.rotationDegrees || 0;

  //   function onChangeRotation(e: ChangeEvent<HTMLInputElement>) {
  //     if (!selectedEditorGuid) return;
  //     setArtworkTransform(selectedEditorGuid, {
  //       rotationDegrees: +e.target.value,
  //     });
  //   }

  return (
    <div
      className={`${styles["floating-container"]} ${styles["artwork-controls-bar"]}`}
    >
      {/* <div>Rotation ({value})</div>
      <input
        type="range"
        min={-180}
        max={180}
        value={value}
        onChange={onChangeRotation}
      /> */}
      <button onClick={() => deleteArtworkFromState(selectedEditorGuid)}>
        Delete
      </button>
    </div>
  );
}
