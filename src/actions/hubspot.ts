"use server";

import { AppError } from "@/error";
import { hubSpotSync } from "@/processes/hubspot/sync";
import { ServerActionResult } from "@/types/types";
import { validateHubSpotSyncFormData } from "@/types/validations";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";

export async function startSync(
  formData: FormData
): Promise<ServerActionResult> {
  try {
    const userEmail = formData.get("userEmail");
    if (!userEmail)
      throw new AppError({
        type: "Client Request",
        clientMessage: "Unknown error.",
        serverMessage: `No user email received from hubspot sync form.`,
        statusCode: BAD_REQUEST,
      });

    const { customers, contacts, lineItems, orders, po, products } =
      await validateHubSpotSyncFormData(formData);
    hubSpotSync({
      customers,
      contacts,
      orders,
      po,
      products,
      lineItems,
      userEmail: `${userEmail}`,
    });
  } catch (error) {
    //currently returning instances of classes from server actions is not supported
    if (error instanceof AppError) {
      console.error(error.serverMessage, error.statusCode);
      return {
        error: {
          message: error.clientMessage,
          statusCode: error.statusCode,
        },
      };
    } else {
      console.error(error);
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
