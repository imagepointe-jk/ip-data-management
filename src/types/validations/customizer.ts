import { cartStateProductVariationSchema } from "../schema/customizer";

export function validateCartStateProductVariation(data: any) {
  return cartStateProductVariationSchema.parse(data);
}
