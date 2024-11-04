import {
  calculatePriceParamsSchema,
  iframeDataSchema,
} from "../schema/pricing";

export function validatePricingRequest(json: any) {
  return calculatePriceParamsSchema.parse(json);
}

export function validateIframeData(json: any) {
  return iframeDataSchema.parse(json);
}
