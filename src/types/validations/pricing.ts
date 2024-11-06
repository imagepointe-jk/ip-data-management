import {
  calculatePriceParamsSchema,
  estimateResponseSchema,
  iframeDataSchema,
} from "../schema/pricing";

export function validatePricingRequest(json: any) {
  return calculatePriceParamsSchema.parse(json);
}

export function validateIframeData(json: any) {
  return iframeDataSchema.parse(json);
}

export function validateEstimateResponse(json: any) {
  return estimateResponseSchema.parse(json);
}
