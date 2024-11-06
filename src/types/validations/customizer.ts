import {
  cartStateProductVariationSchema,
  cartStateProductViewSchema,
  cartStateSchema,
  quoteRequestSchema,
} from "../schema/customizer";

export function validateCartStateProductVariation(data: any) {
  return cartStateProductVariationSchema.parse(data);
}

export function validateCartStateProductView(data: any) {
  return cartStateProductViewSchema.parse(data);
}

export function validateQuoteRequest(data: any) {
  return quoteRequestSchema.parse(data);
}

export function validateCartState(data: any) {
  return cartStateSchema.parse(data);
}
