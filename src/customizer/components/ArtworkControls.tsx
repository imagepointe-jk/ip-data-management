import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import { deleteArtworkFromState } from "../redux/slices/cart";
import { setSelectedEditorGuid } from "../redux/slices/editor";

export function ArtworkControls() {
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const dispatch = useDispatch();

  function onClickDelete() {
    if (!selectedEditorGuid) return;

    dispatch(deleteArtworkFromState({ guid: selectedEditorGuid }));
    dispatch(setSelectedEditorGuid(null));
  }

  if (!selectedEditorGuid) return <></>;

  return (
    <div
      className={`${styles["floating-container"]} ${styles["artwork-controls-bar"]}`}
    >
      <button onClick={onClickDelete}>Delete</button>
    </div>
  );
}
