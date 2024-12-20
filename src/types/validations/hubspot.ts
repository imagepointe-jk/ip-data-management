import { AppError } from "@/error";
import { cleanupProductsSheet } from "@/processes/hubspot/handleData";
import { getHeaderRowValues, getSheetFromBuffer } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import {
  contactSchema,
  customerSchema,
  hubSpotOwnerSchema,
  lineItemSchema,
  orderSchema,
  poSchema,
  productSchema,
} from "../schema/hubspot";
import { z } from "zod";

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

export function parseHubSpotOwnerResults(json: any) {
  return z.object({ results: z.array(hubSpotOwnerSchema) }).parse(json);
}

function validateArray<T>(requiredValues: T[], inputArray: T[]) {
  for (const required of requiredValues) {
    const found = !!inputArray.find((inputVal) => inputVal === required);
    if (!found) return false;
  }
  return true;
}
