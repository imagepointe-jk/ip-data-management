import {
  CartStateProductVariation,
  CartStateProductView,
  QuoteRequestData,
} from "@/types/schema/customizer";
import { checkEnvVariable } from "@/utility/misc";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
checkEnvVariable(baseUrl);

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

export async function getRenderedSingleView(
  view: CartStateProductView,
  bgImgUrl: string
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const raw = JSON.stringify({ view, bgImgUrl });
  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
  };

  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/customizer/render/view`,
    requestOptions
  );
}

export async function submitQuoteRequest(data: QuoteRequestData) {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(data),
  };

  return fetch(`${baseUrl}/api/customizer/quote/request`, requestOptions);
}
