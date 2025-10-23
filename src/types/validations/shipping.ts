import {
  upsBatchRateRequestSchema,
  upsRateRequestSchema,
  upsRateResponseSchema,
  uspsDomesticPriceRequestSchema,
  uspsInternationalPriceRequestSchema,
  uspsPriceResponseSchema,
} from "../schema/shipping";

export function validateUpsRateRequest(json: any) {
  preProcessUpsRateRequestJson(json);
  return upsRateRequestSchema.parse(json);
}

export function validateUpsBatchRateRequest(json: any) {
  if (Array.isArray(json)) {
    for (const item of json) {
      preProcessUpsRateRequestJson(item);
    }
  }
  return upsBatchRateRequestSchema.parse(json);
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

function preProcessUpsRateRequestJson(json: any) {
  const packageData = json.RateRequest?.Shipment?.Package;
  if (packageData && !Array.isArray(packageData)) {
    //UPS API allows this to be an array or a single object
    //for parsing purposes, make it an array if it isn't already
    json.RateRequest.Shipment.Package = [packageData];
  }
}
