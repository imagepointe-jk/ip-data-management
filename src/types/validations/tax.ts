import { z } from "zod";
import { taxImportTableSchema, wooTaxRowSchema } from "../schema/tax";

export function validateTaxImportData(json: any) {
  return taxImportTableSchema.parse(json);
}

export function validateWooTaxRows(json: any) {
  return z.array(wooTaxRowSchema).parse(json);
}
