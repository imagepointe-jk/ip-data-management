import {
  cartStateProductVariationSchema,
  quoteRequestSchema,
} from "../schema/customizer";

export function validateCartStateProductVariation(data: any) {
  return cartStateProductVariationSchema.parse(data);
}

export function validateQuoteRequest(data: any) {
  return quoteRequestSchema.parse(data);
}
