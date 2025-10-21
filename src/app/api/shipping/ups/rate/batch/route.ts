import { easyCorsInit } from "@/constants";
import { NextRequest } from "next/server";
import { validateUpsBatchRateRequest } from "@/types/validations/shipping";
import { getUpsRate } from "@/fetch/shipping";
import { AppError } from "@/error";
import { handleRequestError } from "@/app/api/handleError";
import { parseUpsError } from "../helpers";
import { INTERNAL_SERVER_ERROR, OK } from "@/utility/statusCodes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateUpsBatchRateRequest(body);

    const requests: Promise<{
      statusCode: number;
      message: string | null;
      data: any;
    }>[] = parsed.map(async (item) => {
      try {
        const response = await getUpsRate(item);
        if (!response.ok) {
          const error = await parseUpsError(response);
          throw error;
        }
        const json = await response.json();
        return {
          statusCode: OK,
          message: null,
          data: json,
        };
      } catch (error) {
        if (error instanceof AppError) {
          return {
            statusCode: error.statusCode,
            message: error.clientMessage,
            data: null,
          };
        } else {
          return {
            statusCode: INTERNAL_SERVER_ERROR,
            message: "There was an unknown issue requesting a rate from UPS.",
            data: null,
          };
        }
      }
    });
    const responses = await Promise.all(requests);

    return Response.json(responses, easyCorsInit);
  } catch (error) {
    return handleRequestError(error);
  }
}
