import {
  cartStateProductVariationSchema,
  cartStateProductViewSchema,
  cartStateSchema,
  googleFontSchema,
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

export function validateGoogleFontsJson(json: any) {
  const items = json.items;
  if (!Array.isArray(items)) throw new Error("No fonts array found");

  return items.map((item) =>
    googleFontSchema.parse({
      family: item.family,
      //currently only care about the default style for each font
      //some don't have a "regular", so a few fallbacks are provided
      url:
        item.files.regular ||
        item.files["300"] ||
        item.files.italic ||
        item.files["700"] ||
        "URL_NOT_FOUND",
    })
  );
}
