"use server";

import { AppError } from "@/error";
import { validateASIProducts } from "@/types/validations/products";
import { getSheetFromBuffer } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

export async function uploadSyncData(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new AppError({
      type: "Client Request",
      clientMessage: "Invalid or missing file.",
      serverMessage: "Invalid or missing file.",
      statusCode: BAD_REQUEST,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const asiSheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "ASI");
  const parsed = validateASIProducts(asiSheet);

  console.log(parsed[0]);
}
