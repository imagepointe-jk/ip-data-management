import { taxImportTableSchema } from "../schema/tax";

export function validateTaxImportData(json: any) {
  return taxImportTableSchema.parse(json);
}
