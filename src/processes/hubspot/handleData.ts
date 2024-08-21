import {
  Obj,
  getSheetRawCells,
  jsonToSheet,
  sheetToJson,
} from "@/utility/spreadsheet";
import { WorkSheet } from "xlsx";
import { DataError } from "./error";
import { ZodError } from "zod";
import { makeStringTitleCase } from "@/utility/misc";
import { getAllOwners } from "./fetch";
import {
  Contact,
  Customer,
  HubSpotOwner,
  ImpressDataType,
  LineItem,
  Order,
  PO,
  Product,
} from "@/types/schema/hubspot";
import {
  parseContact,
  parseCustomer,
  parseLineItem,
  parseOrder,
  parsePo,
  parseProduct,
} from "@/types/validations/hubspot";

export async function handleData(worksheetInput: {
  customers: WorkSheet;
  contacts: WorkSheet;
  orders: WorkSheet;
  po: WorkSheet;
  products: WorkSheet;
  lineItems: WorkSheet;
  userEmail: string;
}) {
  const customers = getCustomersAndErrors(worksheetInput.customers);
  const contacts = getContactsAndErrors(worksheetInput.contacts);
  const po = getPoAndErrors(worksheetInput.po);
  const owners = await getAllOwners();
  const orders = getOrdersAndErrors(worksheetInput.orders, owners, po);
  const products = getProductsAndErrors(worksheetInput.products);
  const lineItems = getLineItemsAndErrors(worksheetInput.lineItems, products);

  return {
    customers,
    contacts,
    orders,
    po,
    products,
    lineItems,
  };
}

export function getCustomersAndErrors(
  sheet: WorkSheet
): (Customer | DataError)[] {
  return parseSheetData(
    sheet,
    "Customer",
    parseCustomer,
    (row) => row["Customer Number"]
  );
}

export function getContactsAndErrors(
  sheet: WorkSheet
): (Contact | DataError)[] {
  const parsed = parseSheetData(
    sheet,
    "Contact",
    parseContact,
    (row) => `Contact for customer number ${row["Customer Number"]}`
  );
  return deduplicateContacts(parsed);
}

function deduplicateContacts(contactsAndErrors: (Contact | DataError)[]) {
  const seenEmails: { [key: string]: boolean } = {};
  const deduplicated: (Contact | DataError)[] = [];

  for (const contact of contactsAndErrors) {
    if (contact instanceof DataError) {
      deduplicated.push(contact);
      continue;
    }
    const alreadySeen = seenEmails[contact.Email] === true;
    if (alreadySeen) continue;

    deduplicated.push(contact);
    seenEmails[contact.Email] = true;
  }

  return deduplicated;
}

export function getOrdersAndErrors(
  sheet: WorkSheet,
  allOwners: HubSpotOwner[],
  allPo: (PO | DataError)[]
): (Order | DataError)[] {
  const ordersAndErrors = parseSheetData(
    sheet,
    "Order",
    parseOrder,
    (row) => row["Sales Order#"]
  );
  return ordersAndErrors.map((item) => {
    if (item instanceof DataError) return item;
    return enrichOrder(item, allOwners, allPo);
  });
}

export function getPoAndErrors(sheet: WorkSheet): (PO | DataError)[] {
  return parseSheetData(
    sheet,
    "PO",
    parsePo,
    (row) => `PO for order ${row["Sales Order#"]}`
  );
}

function enrichOrder(
  order: Order,
  allOwners: HubSpotOwner[],
  allPo: (PO | DataError)[]
): Order {
  //To assign a HubSpot owner, we need their HubSpot id, and currently HubSpot doesn't allow us to search this by name.
  const foundOwner = allOwners.find(
    (owner) =>
      `${owner.firstName} ${owner.lastName}`.toLocaleLowerCase() ===
      order["Agent Name#1"]?.toLocaleLowerCase()
  );
  const foundPo = allPo.find(
    (po) =>
      !(po instanceof DataError) && po["Sales Order#"] === order["Sales Order#"]
  );
  const newOrder = { ...order };
  newOrder["Invoice Date"] = newOrder["Entered Date"];
  newOrder.Pipeline = "default";
  newOrder["Deal Stage"] = "closedwon";
  if (newOrder.Shorted) newOrder["Deal Stage"] = "closedlost";
  if (!newOrder.Shorted && !newOrder["Invoice Date"])
    newOrder["Deal Stage"] = "contractsent";
  newOrder["HubSpot Owner ID"] = foundOwner ? `${foundOwner.id}` : undefined;
  newOrder["PO#"] =
    foundPo && !(foundPo instanceof DataError) ? foundPo["PO#"] : undefined;
  newOrder["Sales Order Type"] = newOrder["Sales Order Type"]
    ? cleanupSalesOrderType(newOrder["Sales Order Type"])
    : undefined;

  return newOrder;
}

function cleanupSalesOrderType(salesOrderType: string) {
  const titleCase = makeStringTitleCase(salesOrderType);
  return titleCase
    .replace("Asi", "ASI")
    .replace("Dtf", "DTF")
    .replace("Dtg", "DTG");
}

export function getProductsAndErrors(
  sheet: WorkSheet
): (Product | DataError)[] {
  return parseSheetData(sheet, "Product", parseProduct, (row) => row["Name"]);
}

export function cleanupProductsSheet(sheet: WorkSheet) {
  const productsPerPage = 59;
  const products: Product[] = [
    {
      Name: "Less than Minimum Charge - Dye Sub",
      SKU: "<MIN-DS",
      "Product Type": "Service",
      "Unit Price": 0,
    },
    {
      Name: "Less than Minimum Charge - Embroidery",
      SKU: "<MIN-EMB",
      "Product Type": "Service",
      "Unit Price": 0,
    },
    {
      Name: "Less than Minimum Charge - PIP",
      SKU: "<MIN-PIP",
      "Product Type": "Service",
      "Unit Price": 0,
    },
    {
      Name: "Less than Minimum Charge - Screen Print",
      SKU: "<MIN-SP",
      "Product Type": "Service",
      "Unit Price": 0,
    },
  ];

  for (let page = 0; page < 500; page++) {
    const startingRow = page * 63 + 5; //formula determined by observing pattern of Impress paginated output
    const rows = getSheetRawCells(
      {
        columns: {
          from: 1,
          to: 2,
        },
        rows: {
          from: startingRow,
          to: startingRow + productsPerPage - 1,
        },
      },
      sheet
    );
    const firstVal = rows[0]![0];
    const noPage = firstVal === undefined;
    if (noPage) break;

    for (const row of rows) {
      const SKU = row[0];
      const Name = row[1];
      if (!SKU) break;
      products.push({
        SKU,
        Name,
        "Unit Price": 0,
      });
    }
  }

  return jsonToSheet(products);
}

export function getLineItemsAndErrors(
  sheet: WorkSheet,
  allProducts: (Product | DataError)[]
): (LineItem | DataError)[] {
  const lineItemsAndErrors = parseSheetData(
    sheet,
    "Line Item",
    parseLineItem,
    (row) => `Line item for order ${row["Sales Order#"]} and SKU ${row["SKU#"]}`
  );
  return lineItemsAndErrors.map((item) => {
    if (item instanceof DataError) return item;
    return enrichLineItem(item, allProducts);
  });
}

function enrichLineItem(
  lineItem: LineItem,
  allProducts: (Product | DataError)[]
): LineItem {
  const newLineItem = { ...lineItem };
  newLineItem.SKU = newLineItem["Item#"]
    ? newLineItem["Item#"]
    : newLineItem["SKU#"];
  const foundProduct = allProducts.find(
    (product) =>
      !(product instanceof DataError) && product.SKU === newLineItem.SKU
  );
  if (foundProduct && !(foundProduct instanceof DataError))
    newLineItem.Name = foundProduct.Name;

  return newLineItem;
}

function parseSheetData<T>(
  sheet: WorkSheet,
  type: ImpressDataType,
  parseFn: (row: any) => T,
  createRowIdentifier?: (row: any) => string
): (T | DataError)[] {
  const raw: Obj[] = sheetToJson(sheet);
  const parsedRows = raw.map((row, i) => {
    const rowIdentifier = createRowIdentifier
      ? createRowIdentifier(row)
      : "UNKNOWN";
    try {
      return parseFn(row);
    } catch (error) {
      if (error instanceof ZodError) {
        const badFields = error.issues
          .map((issue) => issue.path.join(""))
          .join(", ");
        return new DataError(
          type,
          rowIdentifier,
          i,
          `Encountered issues with the following fields: ${badFields}`
        );
      }
      return new DataError(
        type,
        rowIdentifier,
        i,
        `Unknown error while parsing`
      );
    }
  });
  return parsedRows;
}
