export async function uploadFile(file: File, token: string, fileName?: string) {
  const headers = new Headers();
  const fileExtension = file.name.split(".").pop();
  headers.append(
    "Dropbox-API-Arg",
    JSON.stringify({
      path: `/Marketing/Website/Customizer/${
        fileName && fileExtension ? `${fileName}.${fileExtension}` : file.name
      }`,
    })
  );
  headers.append("Content-Type", "application/octet-stream");
  headers.append("Authorization", `Bearer ${token}`);

  const requestOptions = {
    method: "POST",
    headers,
    body: file,
  };

  return fetch("https://content.dropboxapi.com/2/files/upload", requestOptions);
}
