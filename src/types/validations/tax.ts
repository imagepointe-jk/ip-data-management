import { z } from "zod";
import {
  TaxImportRow,
  taxImportRowSchema,
  wooTaxRowSchema,
} from "../schema/tax";
import { clamp } from "@/utility/misc";

export function validateTaxImportData(json: any) {
  const arr = json as any[];
  const zipCodeLength = 5;

  const parsedRows: TaxImportRow[] = arr.map((item) => {
    const zip = +`${item.Zip}`;
    if (isNaN(zip)) throw new Error(`Zip code ${item.Zip} is invalid.`);

    //pad incoming zip code numbers with leading zeroes if needed (e.g. 123 -> 00123)
    item.Zip =
      "0".repeat(
        clamp(zipCodeLength - `${item.Zip}`.length, 0, Number.MAX_SAFE_INTEGER)
      ) + `${item.Zip}`;

    return taxImportRowSchema.parse(item);
  });

  return parsedRows;
}

export function validateWooTaxRows(json: any) {
  return z.array(wooTaxRowSchema).parse(json);
}
