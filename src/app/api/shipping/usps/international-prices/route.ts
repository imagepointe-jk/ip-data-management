import { easyCorsInit } from "@/constants";
import { AppError } from "@/error";
import { getUspsInternationalPrice } from "@/fetch/shipping";
import { validateUspsInternationalPriceRequest } from "@/types/validations/shipping";
import { NextRequest } from "next/server";
import { handleRequestError } from "../../../handleError";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateUspsInternationalPriceRequest(body);
    const uspsResponse = await getUspsInternationalPrice(parsed);
    if (!uspsResponse.ok)
      throw new AppError({
        type: "Unknown",
        clientMessage: "There was an issue reaching the USPS servers.",
        serverMessage: `USPS API response had status ${uspsResponse.status}`,
        statusCode: uspsResponse.status,
      });
    const uspsJson = await uspsResponse.json();

    return Response.json(uspsJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
