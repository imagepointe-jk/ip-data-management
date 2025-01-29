"use server";

import { AppError } from "@/error";
import { validateStockImportData } from "@/types/validations/dignity-apparel";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";

export async function startSync(formData: FormData) {
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
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "Woo_Import");
  const json = sheetToJson(sheet);
  const validated = validateStockImportData(json);
  console.log(
    `${validated.parsed.length} rows parsed, ${validated.errorIndices.length} errors`
  );
}
