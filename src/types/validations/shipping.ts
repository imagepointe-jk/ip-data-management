import {
  upsRateRequestSchema,
  upsRateResponseSchema,
  uspsDomesticPriceRequestSchema,
  uspsInternationalPriceRequestSchema,
  uspsPriceResponseSchema,
} from "../schema/shipping";

export function validateUpsRateRequest(json: any) {
  return upsRateRequestSchema.parse(json);
}

export function validateUpsRateResponse(json: any) {
  return upsRateResponseSchema.parse(json);
}

export function validateUspsDomesticPriceRequest(json: any) {
  return uspsDomesticPriceRequestSchema.parse(json);
}

export function validateUspsInternationalPriceRequest(json: any) {
  return uspsInternationalPriceRequestSchema.parse(json);
}

export function validateUspsPriceResponse(json: any) {
  return uspsPriceResponseSchema.parse(json);
}
