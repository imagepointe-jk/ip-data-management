import { uploadFileAction } from "@/actions/dropbox";
import { ChangeEvent } from "react";

export function UserUploads() {
  async function onChoose(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const file = files[0];
    if (!file) return;

    console.log(file.name);
    try {
      console.log("uploading...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", "example-43");
      await uploadFileAction(formData);
      console.log("done");
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
