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
    if (!upsResponse.ok) await handleUpsError(upsResponse);

    const upsJson = await upsResponse.json();

    return Response.json(upsJson, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}

async function handleUpsError(response: Response) {
  try {
    const json = await response.json();
    const errors = json.response.errors as { code: string; message: string }[];
    const errorMatch = upsErrors.find(
      (upsError) => errors[0]?.code === upsError.code
    );

    throw new AppError({
      type: errorMatch ? "Client Request" : "Unknown",
      clientMessage: errorMatch
        ? errorMatch.message
        : "There was an unknown issue requesting a rate from UPS.",
      serverMessage: JSON.stringify(errors),
      statusCode: response.status,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      type: "Unknown",
      clientMessage: "There was an unknown issue requesting a rate from UPS.",
      serverMessage: `Unknown UPS error with status ${response.status}`,
      statusCode: response.status,
    });
  }
}

const upsErrors: { code: string; message: string }[] = [
  {
    code: "111217",
    message: "Service not available for the given location(s)",
  },
  {
    code: "111100",
    message: "Service not available for the given location(s)",
  },
  {
    code: "111210",
    message: "Service not available for the given location(s)",
  },
  {
    code: "111580",
    message: "Missing/invalid account number",
  },
  {
    code: "111285",
    message: "Invalid postal code",
  },
  {
    code: "110208",
    message: "Invalid address detail(s)",
  },
  {
    code: "111286",
    message: "Invalid state",
  },
  {
    code: "111215",
    message: "Service not available for residential destinations",
  },
];
