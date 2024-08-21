import {
  Contact,
  Customer,
  ImpressDataType,
  LineItem,
  Order,
  Product,
} from "@/types/schema/hubspot";

export class DataError extends Error {
  public readonly rowIdentifier;
  public readonly rowNumber; //this is not necessarily the actual row number in Excel because if there are blank rows, they will be skipped
  public readonly type;

  constructor(
    type: ImpressDataType,
    rowIdentifier: string,
    rowNumber: number,
    message?: string
  ) {
    super(message);

    this.type = type;
    this.rowIdentifier = rowIdentifier;
    this.rowNumber = rowNumber;
  }
}

type IssueType = "Environment" | "API" | "Data Integrity" | "Unknown";

export class SyncError extends Error {
  public readonly type;
  public readonly statusCode;
  public readonly responseJsonString;
  public readonly resourceType;
  public readonly resourceIdentifier;

  constructor(
    type: IssueType,
    resourceType?: ImpressDataType,
    resourceIdentifier?: string,
    message?: string,
    statusCode?: number,
    responseJsonString?: string
  ) {
    super(message);

    this.type = type;
    this.statusCode = statusCode;
    this.responseJsonString = responseJsonString;
    this.resourceType = resourceType;
    this.resourceIdentifier = resourceIdentifier;
  }
}

export class SyncWarning {
  public readonly type;
  public readonly message;

  constructor(type: IssueType, message: string) {
    this.type = type;
    this.message = message;
  }
}

export function gatherAllIssues(data: {
  customers: (Customer | DataError)[];
  contacts: (Contact | DataError)[];
  orders: (Order | DataError)[];
  products: (Product | DataError)[];
  lineItems: (LineItem | DataError)[];
  syncErrors: SyncError[];
  syncWarnings: SyncWarning[];
}) {
  const {
    contacts,
    customers,
    lineItems,
    orders,
    products,
    syncErrors,
    syncWarnings,
  } = data;
  const impressData = [
    ...customers,
    ...contacts,
    ...orders,
    ...products,
    ...lineItems,
  ];
  const dataErrors: DataError[] = [];
  for (const data of impressData) {
    if (data instanceof DataError) dataErrors.push(data);
  }

  return [...dataErrors, ...syncErrors, ...syncWarnings];
}
