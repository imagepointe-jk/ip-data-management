import { env } from "@/env";
import { getEnvVariable } from "@/utility/misc";

export async function uploadMedia(
  file: File,
  realMediaLibraryFolderId?: number
) {
  const key = env.IP_WP_APPLICATION_USERNAME;
  const secret = env.IP_WP_APPLICATION_PASSWORD;
  const headers = new Headers();

  headers.append("Authorization", `Basic ${btoa(`${key}:${secret}`)}`);

  const formdata = new FormData();
  formdata.append("file", file);
  if (realMediaLibraryFolderId !== undefined) {
    formdata.append("rmlFolder", `${realMediaLibraryFolderId}`);
  }

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: formdata,
  };

  return fetch(
    "https://www.imagepointe.com/wp-json/wp/v2/media",
    requestOptions
  );
}
