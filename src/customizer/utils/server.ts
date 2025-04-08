import { PRODUCT_CUSTOMIZER_RML_FOLDER_ID } from "@/constants";
import { AppError } from "@/error";
import { uploadMedia } from "@/fetch/wordpress";

export async function uploadImage(file: File) {
  const response = await uploadMedia(file, PRODUCT_CUSTOMIZER_RML_FOLDER_ID);

  if (!response.ok) {
    const wpError = await response
      .json()
      .then((json) => json.message)
      .catch(() => "(no WP error found)");
    throw new AppError({
      type: "Unknown",
      clientMessage: `Failed to upload image`,
      serverMessage: `Failed to upload image; WP error: ${wpError}`,
      statusCode: response.status,
    });
  }

  const json = await response.json();
  return {
    uploadedUrl: json.guid.rendered,
  };
}
