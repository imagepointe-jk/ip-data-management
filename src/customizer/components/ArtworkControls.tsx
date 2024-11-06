import styles from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { useDispatch } from "react-redux";
import {
  deleteArtworkFromState,
  deleteTextFromState,
} from "../redux/slices/cart";
import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";

export function ArtworkControls() {
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const { selectedLocation } = useEditorSelectors();
  const dispatch = useDispatch();

  function onClickDelete() {
    if (!selectedEditorGuid) return;

    const selectedArtwork = selectedLocation.artworks.find(
      (art) => art.objectData.editorGuid === selectedEditorGuid
    );
    const selectedText = selectedLocation.texts.find(
      (text) => text.objectData.editorGuid === selectedEditorGuid
    );

    if (selectedArtwork)
      dispatch(deleteArtworkFromState({ guid: selectedEditorGuid }));
    if (selectedText)
      dispatch(deleteTextFromState({ guid: selectedEditorGuid }));

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
