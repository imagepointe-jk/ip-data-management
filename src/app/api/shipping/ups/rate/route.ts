import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";
import { handleRequestError } from "../../../handleError";
import { validateUpsRateRequest } from "@/types/validations/shipping";
import { getUpsRate } from "@/fetch/shipping";
import { parseUpsError } from "./helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateUpsRateRequest(body);
    const upsResponse = await getUpsRate(parsed);
    if (!upsResponse.ok) {
      const error = await parseUpsError(upsResponse);
      throw error;
    }

    const upsJson = await upsResponse.json();

    return Response.json(upsJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
