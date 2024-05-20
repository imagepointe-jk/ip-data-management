"use server";

import { File } from "buffer";

export async function startSync(formData: FormData) {
  const customers = formData.get("customers") as unknown;
  if (!(customers instanceof File)) throw new Error("not file");

  console.log("received");
}
