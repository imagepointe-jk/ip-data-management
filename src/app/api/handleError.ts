import { easyCorsInit } from "@/constants";
import { AppError } from "@/error";
import { message } from "@/utility/misc";
import { INTERNAL_SERVER_ERROR } from "@/utility/statusCodes";

export function handleRequestError(error: unknown) {
  if (error instanceof AppError) {
    error.serverPrint();
    return Response.json(message(error.clientMessage), {
      ...easyCorsInit,
      status: error.statusCode,
    });
  } else {
    console.error(error);
    return Response.json(message("Unknown error."), {
      ...easyCorsInit,
      status: INTERNAL_SERVER_ERROR,
    });
  }
}
