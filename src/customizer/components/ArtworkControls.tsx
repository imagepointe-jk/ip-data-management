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
import { ActionCreators } from "redux-undo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faRedo,
  faTrashAlt,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export function ArtworkControls() {
  const [expanded, setExpanded] = useState(false); //may want to store this state in redux at some point, but not necessary now
  const selectedEditorGuid = useSelector(
    (store: StoreType) => store.editorState.selectedEditorGuid
  );
  const { selectedView } = useEditorSelectors();
  const dispatch = useDispatch();

  function onClickDelete() {
    if (!selectedEditorGuid) return;

    const selectedArtwork = selectedView.artworks.find(
      (art) => art.objectData.editorGuid === selectedEditorGuid
    );
    const selectedText = selectedView.texts.find(
      (text) => text.objectData.editorGuid === selectedEditorGuid
    );

    if (selectedArtwork)
      dispatch(deleteArtworkFromState({ guid: selectedEditorGuid }));
    if (selectedText)
      dispatch(deleteTextFromState({ guid: selectedEditorGuid }));

    dispatch(setSelectedEditorGuid(null));
  }

  return (
    <div
      className={`${styles["floating-container"]} ${
        styles["artwork-controls-bar"]
      } ${expanded ? styles["expanded"] : ""}`}
    >
      <button onClick={() => dispatch(ActionCreators.undo())}>
        <FontAwesomeIcon icon={faUndo} />
        {" Undo"}
      </button>
      <button onClick={() => dispatch(ActionCreators.redo())}>
        <FontAwesomeIcon icon={faRedo} />
        {" Redo"}
      </button>
      <button onClick={onClickDelete} disabled={!selectedEditorGuid}>
        <FontAwesomeIcon icon={faTrashAlt} />
        {" Delete"}
      </button>
      <button
        className={styles["artwork-controls-bar-toggle"]}
        onClick={() => setExpanded(!expanded)}
      >
        <FontAwesomeIcon
          icon={faChevronUp}
          className={styles["artwork-controls-bar-toggle-icon"]}
        />
        {expanded ? " Hide Tools" : "Show Tools"}
      </button>
    </div>
  );
}
