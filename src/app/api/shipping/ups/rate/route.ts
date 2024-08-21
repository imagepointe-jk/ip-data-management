import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";
import { handleRequestError } from "../../../handleError";
import { validateUpsRateRequest } from "@/types/validations/shipping";
import { getUpsRate } from "@/fetch/shipping";
import { AppError } from "@/error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateUpsRateRequest(body);
    const upsResponse = await getUpsRate(parsed);
    if (!upsResponse.ok)
      throw new AppError({
        type: "Unknown",
        clientMessage: "There was an issue reaching the UPS servers.",
        serverMessage: `UPS API response had status ${upsResponse.status}`,
        statusCode: upsResponse.status,
      });
    const upsJson = await upsResponse.json();

    return Response.json(upsJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
