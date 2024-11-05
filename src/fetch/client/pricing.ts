import { env } from "@/envClient";
import { CalculatePriceParams } from "@/types/schema/pricing";

export async function getPriceEstimate(data: CalculatePriceParams) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify(data);

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
  };

  return fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/pricing`, requestOptions);
}
