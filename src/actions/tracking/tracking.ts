"use server";

import { getDASearches } from "@/db/access/tracking";
import { sendEmail } from "@/utility/mail";
import { dataToSheetBuffer } from "@/utility/spreadsheet";

export async function exportDASearches(targetEmail: string) {
  const searches = await getDASearches();
  const sheetBuffer = dataToSheetBuffer(searches, "DA Searches");
  await sendEmail(
    targetEmail,
    "DA Search Export",
    "The exported search records are attached.",
    [{ content: sheetBuffer, filename: "issues.xlsx" }]
  );
}
