import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_AUTHENTICATED,
  RESOURCE_CONFLICT,
} from "./utility/statusCodes";

type AppErrorType =
  | "Authentication"
  | "Environment"
  | "Client Request"
  | "Server State"
  | "Database"
  | "Unknown";

export class AppError extends Error {
  public readonly type;
  public readonly serverMessage;
  public readonly clientMessage;
  public readonly statusCode;

  constructor(data: {
    type: AppErrorType;
    serverMessage?: string;
    clientMessage?: string;
    statusCode?: number;
  }) {
    super(data.serverMessage);

    this.type = data.type;
    this.serverMessage = data.serverMessage || "Unknown error.";
    this.clientMessage = data.clientMessage || "Unknown error.";
    this.statusCode = data.statusCode || approximateErrorStatusCode(data.type);
  }

  serverPrint() {
    console.error(
      `${this.type} error: ${this.serverMessage} (Status Code ${this.statusCode})`
    );
  }
}

function approximateErrorStatusCode(type: AppErrorType) {
  switch (type) {
    case "Authentication":
      return NOT_AUTHENTICATED;
    case "Client Request":
      return BAD_REQUEST;
    case "Database":
      return INTERNAL_SERVER_ERROR;
    case "Environment":
      return INTERNAL_SERVER_ERROR;
    case "Server State":
      return RESOURCE_CONFLICT;
    default:
      return INTERNAL_SERVER_ERROR;
  }
}
