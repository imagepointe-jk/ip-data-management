import { calculatePriceParamsSchema } from "../schema/pricing";

export function validatePricingRequest(json: any) {
  return calculatePriceParamsSchema.parse(json);
}
