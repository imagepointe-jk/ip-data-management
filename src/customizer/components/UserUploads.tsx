import { uploadMediaAction } from "@/actions/wordpress";
import { ChangeEvent, useRef, useState } from "react";
import styles from "@/styles/customizer/CustomProductDesigner/upload.module.css";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useDispatch } from "react-redux";
import { addDesign } from "../redux/slices/cart";
import {
  setDialogOpen,
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { v4 as uuidv4 } from "uuid";
import { PRODUCT_CUSTOMIZER_USER_UPLOADS_RML_FOLDER_ID } from "@/constants";

export function UserUploads() {
  const [status, setStatus] = useState("idle" as "idle" | "loading" | "error");
  const inputRef = useRef(null as HTMLInputElement | null);
  const dispatch = useDispatch();
  const { selectedProductData } = useEditorSelectors();
  const selectedViewId = useSelector(
    (store: StoreType) => store.editorState.selectedViewId
  );

  async function onChoose(e: ChangeEvent<HTMLInputElement>) {
    if (status === "loading") return;
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    if (!file) return;

    const fileExtension = file.name.split(".")[1];
    const withNewFilename = new File(
      [file],
      `user-uploaded-design-timestamp-${Date.now()}.${fileExtension}`,
      {
        type: file.type,
        lastModified: file.lastModified,
      }
    );
    const formData = new FormData();
    formData.append("file", withNewFilename);

    setStatus("loading");
    try {
      const uploadedUrl = await uploadMediaAction(
        formData,
        PRODUCT_CUSTOMIZER_USER_UPLOADS_RML_FOLDER_ID
      );
      setStatus("idle");
      const newGuid = uuidv4();
      dispatch(
        addDesign({
          targetViewId: selectedViewId,
          newGuid,
          addUploadPayload: {
            uploadedUrl,
          },
          targetProductData: selectedProductData,
        })
      );
      dispatch(setDialogOpen(null));
      dispatch(setSelectedEditorGuid(newGuid));

      if (inputRef.current !== null) {
        //@ts-expect-error: null not assignable to string
        inputRef.current.value = null;
      }
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <div className={styles["main"]}>
      <h2>Upload Artwork</h2>
      <div>Add your own artwork to this design.</div>
      <label
        htmlFor="customizer-upload"
        className={`basic-button ${styles["upload-label-as-button"]}`}
      >
        {status !== "loading" && <>Select a File...</>}
        {status === "loading" && (
          <LoadingIndicator className={styles["spinner"]} />
        )}
        <input
          id="customizer-upload"
          type="file"
          onChange={onChoose}
          ref={inputRef}
        />
      </label>
      {status === "error" && (
        <div style={{ color: "red" }}>There was an error.</div>
      )}
    </div>
  );
}
