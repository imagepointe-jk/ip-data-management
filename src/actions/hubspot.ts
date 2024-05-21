"use server";

import { AppError } from "@/error";
import { ServerActionResult } from "@/types/types";
import { validateHubSpotSyncFormData } from "@/types/validations";
import { INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";

export async function startSync(
  formData: FormData
): Promise<ServerActionResult> {
  try {
    const { customers, contacts, lineItems, orders, po, products } =
      await validateHubSpotSyncFormData(formData);
  } catch (error) {
    //currently returning instances of classes from server actions is not supported
    if (error instanceof AppError) {
      return {
        error: {
          message: error.clientMessage,
          statusCode: error.statusCode,
        },
      };
    } else {
      return {
        error: {
          message: "Unknown error.",
          statusCode: INTERNAL_SERVER_ERROR,
        },
      };
    }
  }
  return {
    message: "Sync started.",
  };
}
