"use server";

import { AppError } from "@/error";
import { uploadMedia } from "@/fetch/wordpress";

export async function uploadMediaAction(
  formData: FormData,
  realMediaLibraryFolderId?: number
) {
  try {
    const file = formData.get("file") as File;
    const response = await uploadMedia(file, realMediaLibraryFolderId);

    const json = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(json));

    return json.guid.rendered as string;
  } catch (error) {
    if (error instanceof AppError) {
      error.serverPrint();
      throw new Error(error.clientMessage);
    } else {
      console.error(error);
      throw new Error("Unknown error.");
    }
  }
}
