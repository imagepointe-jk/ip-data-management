import { uploadMediaAction } from "@/actions/wordpress";
import { ChangeEvent } from "react";

export function UserUploads() {
  async function onChoose(e: ChangeEvent<HTMLInputElement>) {
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

    try {
      const hostedUrl = await uploadMediaAction(formData, 8);
      console.log("uploaded at", hostedUrl);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <input type="file" onChange={onChoose} />
    </div>
  );
}
