import { AppError } from "@/error";

export async function parseUpsError(response: Response): Promise<AppError> {
  try {
    const json = await response.json();
    const errors = json.response.errors as { code: string; message: string }[];
    const errorMatch = upsErrors.find(
      (upsError) => errors[0]?.code === upsError.code
    );

    return new AppError({
      type: errorMatch ? "Client Request" : "Unknown",
      clientMessage: errorMatch
        ? errorMatch.message
        : "There was an unknown issue requesting a rate from UPS.",
      serverMessage: JSON.stringify(errors),
      statusCode: response.status,
    });
  } catch (error) {
    if (error instanceof AppError) return error;
    return new AppError({
      type: "Unknown",
      clientMessage: "There was an unknown issue requesting a rate from UPS.",
      serverMessage: `Unknown UPS error with status ${response.status}`,
      statusCode: response.status,
    });
  }
}

//UPS errors we consider safe to allow the client to see. if an error isn't found in this list, it won't be shown to the client.
const upsErrors: { code: string; message: string }[] = [
  {
    code: "111217",
    message: "Service not available for the given location(s)",
  },
  {
    code: "111100",
    message: "The requested service is invalid from the selected origin",
  },
  {
    code: "111210",
    message:
      "The requested service is unavailable between the selected locations",
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
  {
    code: "120052",
    message:
      "Shipper's UPS Account is not enabled for the requested UPS Ground Saver service",
  },
];
