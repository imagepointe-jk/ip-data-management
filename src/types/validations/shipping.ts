import {
  upsRateRequestSchema,
  upsRateResponseSchema,
} from "../schema/shipping";

export function validateUpsRateRequest(json: any) {
  return upsRateRequestSchema.parse(json);
}

export function validateUpsRateResponse(json: any) {
  return upsRateResponseSchema.parse(json);
}
