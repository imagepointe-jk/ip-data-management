"use server";

import { uploadFile } from "@/fetch/dropbox";

type ShortAccessToken = {
  token: string;
  expiresAt: number;
};
let sat: ShortAccessToken | undefined; //Short Access Token. Should only be accessed via getShortAccessToken.
const credentials = () => {
  const key = process.env.DROPBOX_APP_KEY;
  const secret = process.env.DROPBOX_APP_SECRET;
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;

  if (!key || !secret || !refreshToken)
    throw new Error("Missing Dropbox credential(s)!");
  return { key, secret, refreshToken };
};
const apiUrl = "https://api.dropbox.com";

async function getShortAccessToken() {
  const time = Date.now();
  const oneMinute = 1000 * 60; //give 1 minute of leeway to make sure we never use an expired token
  if (sat && time < sat.expiresAt - oneMinute) return sat;
  //if we get here, it means the token IS expired, so update it

  const { key, refreshToken, secret } = credentials();
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("refresh_token", refreshToken);
  urlencoded.append("grant_type", "refresh_token");
  urlencoded.append("client_id", key);
  urlencoded.append("client_secret", secret);

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: urlencoded,
  };

  const result = await fetch(`${apiUrl}/oauth2/token`, requestOptions);
  const json = await result.json();
  if (!result.ok) {
    console.error(json);
    throw new Error(
      `Received a ${result.status} error while trying to get a Dropbox access token`
    );
  }

  const expiresInMs = json.expires_in * 1000;
  sat = {
    token: json.access_token,
    expiresAt: time + expiresInMs,
  };
  return sat;
}

export async function uploadFileAction(formData: FormData) {
  const { token } = await getShortAccessToken();
  const file = formData.get("file") as File;
  const filename = formData.get("filename") as string;
  await uploadFile(file, token, filename);
}
