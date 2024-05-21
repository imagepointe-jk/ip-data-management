import { AppError } from "@/error";
import {
  getHeaderRowValues,
  getSheetFromBuffer,
  getSheetRawCells,
  jsonToSheet,
} from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { File } from "buffer";
import { WorkSheet } from "xlsx";
import {
  Product,
  contactSchema,
  customerSchema,
  designFormDataSchema,
  lineItemSchema,
  orderSchema,
  poSchema,
  productSchema,
  quoteRequestSchema,
  userFormDataSchema,
} from "./schema";

export function validateUserFormData(formData: FormData) {
  const existingUserId = formData.get("existingUserId");
  const existingUserIdNum = existingUserId ? +existingUserId : undefined;

  return userFormDataSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    existingUserId: existingUserIdNum,
  });
}

export function validateDesignFormData(formData: FormData) {
  const existingDesignId = formData.get("existingDesignId");
  const existingDesignIdNum = existingDesignId ? +existingDesignId : undefined;
  const date = new Date(`${formData.get("date")}`);

  return designFormDataSchema.parse({
    designNumber: formData.get("design-number"),
    description: formData.get("description"),
    featured: !!formData.get("featured"),
    date: isNaN(date.getTime()) ? new Date() : date,
    status: formData.get("status"),
    subcategoryIds: formData.getAll("subcategories"),
    tagIds: formData.getAll("tags"),
    designTypeId: formData.get("design-type"),
    defaultBackgroundColorId: formData.get("bg-color"),
    imageUrl: formData.get("image-url"),
    existingDesignId: existingDesignIdNum,
  });
}

export function validateQuoteRequest(json: any) {
  return quoteRequestSchema.parse(json);
}

export async function validateHubSpotSyncFormData(formData: FormData) {
  const customers = formData.get("customers");
  const contacts = formData.get("contacts");
  const orders = formData.get("orders");
  const po = formData.get("po");
  const products = formData.get("products");
  const lineItems = formData.get("lineItems");

  const allFilesReceived =
    customers instanceof File &&
    contacts instanceof File &&
    orders instanceof File &&
    po instanceof File &&
    products instanceof File &&
    lineItems instanceof File &&
    customers.size > 0 &&
    contacts.size > 0 &&
    orders.size > 0 &&
    po.size > 0 &&
    products.size > 0 &&
    lineItems.size > 0;

  if (!allFilesReceived)
    throw new AppError({
      type: "Client Request",
      clientMessage: "Invalid or missing file(s).",
      serverMessage:
        "At least one of the uploaded files was empty, or not an instance of File.",
      statusCode: BAD_REQUEST,
    });

  const customersArrayBuffer = await customers.arrayBuffer();
  const contactsArrayBuffer = await contacts.arrayBuffer();
  const ordersArrayBuffer = await orders.arrayBuffer();
  const poArrayBuffer = await po.arrayBuffer();
  const productsArrayBuffer = await products.arrayBuffer();
  const lineItemsArrayBuffer = await lineItems.arrayBuffer();

  //getSheetFromBuffer is slow on large inputs. Possible optimization here.
  const customersSheet = getSheetFromBuffer(
    Buffer.from(customersArrayBuffer),
    "customers"
  );
  const contactsSheet = getSheetFromBuffer(
    Buffer.from(contactsArrayBuffer),
    "contacts"
  );
  const ordersSheet = getSheetFromBuffer(
    Buffer.from(ordersArrayBuffer),
    "orders"
  );
  const poSheet = getSheetFromBuffer(Buffer.from(poArrayBuffer), "po");
  const productsSheet = cleanupProductsSheet(
    getSheetFromBuffer(Buffer.from(productsArrayBuffer), "products")
  );
  const lineItemsSheet = getSheetFromBuffer(
    Buffer.from(lineItemsArrayBuffer),
    "line items"
  );

  const requiredCustomerHeaders = ["Customer Name", "Customer Number"];
  const requiredContactHeaders = ["Customer Number", "Name"];
  const requiredOrderHeaders = ["Customer Number", "Sales Order#"];
  const requiredPoHeaders = ["Sales Order#"];
  const requiredProductHeaders = ["SKU"];
  const requiredLineItemHeaders = ["Sales Order#"];

  const haveRequiredHeaders =
    validateArray(
      requiredCustomerHeaders,
      getHeaderRowValues(customersSheet)
    ) &&
    validateArray(requiredContactHeaders, getHeaderRowValues(contactsSheet)) &&
    validateArray(requiredOrderHeaders, getHeaderRowValues(ordersSheet)) &&
    validateArray(requiredPoHeaders, getHeaderRowValues(poSheet)) &&
    validateArray(requiredProductHeaders, getHeaderRowValues(productsSheet)) &&
    validateArray(requiredLineItemHeaders, getHeaderRowValues(lineItemsSheet));

  if (!haveRequiredHeaders)
    throw new AppError({
      type: "Client Request",
      clientMessage: "At least one required header was missing.",
      serverMessage:
        "At least one required header in the received spreadsheet was missing.",
      statusCode: BAD_REQUEST,
    });

  return {
    customers: customersSheet,
    contacts: contactsSheet,
    orders: ordersSheet,
    po: poSheet,
    products: productsSheet,
    lineItems: lineItemsSheet,
  };
}

export function parseCustomer(row: any) {
  return customerSchema.parse(row);
}

export function parseContact(row: any) {
  if (row["Phone#"] !== undefined) row["Phone#"] = `${row["Phone#"]}`;
  if (!row["Name"]) row["Name"] = "No Name";
  if (typeof row["Email"] === "string")
    row["Email"] = row["Email"].toLocaleLowerCase();
  return contactSchema.parse(row);
}

export function parseOrder(row: any) {
  return orderSchema.parse(row);
}

export function parseLineItem(row: any) {
  if (row.Size !== undefined) row.Size = `${row.Size}`;
  return lineItemSchema.parse(row);
}

export function parsePo(row: any) {
  return poSchema.parse(row);
}

export function parseProduct(row: any) {
  return productSchema.parse(row);
}

function validateArray<T>(requiredValues: T[], inputArray: T[]) {
  for (const required of requiredValues) {
    const found = !!inputArray.find((inputVal) => inputVal === required);
    if (!found) return false;
  }
  return true;
}

function cleanupProductsSheet(sheet: WorkSheet) {
  console.log("start cleanup");
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
    const firstVal = rows[0][0];
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

  console.log("finish cleanup");
  return jsonToSheet(products);
}
