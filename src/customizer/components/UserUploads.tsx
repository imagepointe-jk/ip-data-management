import { uploadMediaAction } from "@/actions/wordpress";
import { ChangeEvent, useState } from "react";
import styles from "@/styles/customizer/CustomProductDesigner/upload.module.css";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export function UserUploads() {
  const [status, setStatus] = useState("idle" as "idle" | "loading" | "error");

  async function onChoose(e: ChangeEvent<HTMLInputElement>) {
    if (status === "loading") return;
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    if (!file) return;

    const withNewFilename = new File([file], "customizer-upload.png", {
      type: file.type,
      lastModified: file.lastModified,
    });
    const formData = new FormData();
    formData.append("file", withNewFilename);

    setStatus("loading");
    try {
      const hostedUrl = await uploadMediaAction(formData, 8);
      console.log("uploaded at", hostedUrl);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  }

  return (
    <div className={styles["main"]}>
      <label
        htmlFor="customizer-upload"
        className={styles["upload-label-as-button"]}
      >
        {status !== "loading" && <>Upload</>}
        {status === "loading" && (
          <LoadingIndicator className={styles["spinner"]} />
        )}
        <input id="customizer-upload" type="file" onChange={onChoose} />
      </label>
      {status === "error" && (
        <div style={{ color: "red" }}>There was an error.</div>
      )}
    </div>
  );
}
