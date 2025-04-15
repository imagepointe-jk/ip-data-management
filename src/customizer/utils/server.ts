import { PRODUCT_CUSTOMIZER_RENDER_RML_FOLDER_ID } from "@/constants";
import { AppError } from "@/error";
import { uploadMedia } from "@/fetch/wordpress";

export async function uploadQuoteRequestRender(file: File) {
  const response = await uploadMedia(
    file,
    PRODUCT_CUSTOMIZER_RENDER_RML_FOLDER_ID
  );

  if (!response.ok) {
    const wpError = await response
      .json()
      .then((json) => json.message)
      .catch(() => "(no WP error found)");
    throw new AppError({
      type: "Unknown",
      clientMessage: `Failed to upload render`,
      serverMessage: `Failed to upload render; WP error: ${wpError}`,
      statusCode: response.status,
    });
  }

  const json = await response.json();
  return {
    uploadedUrl: json.guid.rendered,
  };
}
