"use server";

import { AppError } from "@/error";
import { validateTaxImportData } from "@/types/validations/tax";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

export async function uploadTaxData(formData: FormData) {
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
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "Data");
  const json = sheetToJson(sheet);
  const validated = validateTaxImportData(json);

  console.log(validated.map((row) => row.City));
}
