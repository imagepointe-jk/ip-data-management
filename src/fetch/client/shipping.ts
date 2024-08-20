import { UpsRateRequest } from "@/types/schema/shipping";

export async function getUpsRate(request: UpsRateRequest) {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(request),
  };
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/shipping/ups/rate`,
    requestOptions
  );
}
