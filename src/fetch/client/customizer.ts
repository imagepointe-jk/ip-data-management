import { CartStateProductVariation } from "@/types/schema/customizer";

export async function getRenderedVariationViews(
  variation: CartStateProductVariation
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const raw = JSON.stringify(variation);
  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
  };

  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customizer/render/variation`,
    requestOptions
  );
}
