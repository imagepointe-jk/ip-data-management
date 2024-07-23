import { AppError } from "@/error";
import { getHeaderRowValues, getSheetFromBuffer } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { File } from "buffer";
import {
  calculatePriceParamsSchema,
  contactSchema,
  customerSchema,
  designFormDataSchema,
  hubSpotOwnerSchema,
  lineItemSchema,
  orderSchema,
  poSchema,
  productSchema,
  quoteRequestSchema,
  userFormDataSchema,
  wooCommerceLineItemSchema,
  wooCommerceOrderDataSchema,
  wooCommerceProductSchema,
  wooCommerceWebhookRequestSchema,
} from "./schema";
import { cleanupProductsSheet } from "@/processes/hubspot/handleData";
import { z } from "zod";
import { findAllFormValues } from "@/utility/misc";
import { NextRequest } from "next/server";
import { inspect } from "node:util";

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

function extractDesignVariationFormData(formData: FormData) {
  const variationColorFields = findAllFormValues(formData, (name) =>
    name.includes("bg-color-variation")
  );
  const variationUrlFields = findAllFormValues(formData, (name) =>
    name.includes("image-url-variation")
  );
  const variationCategoryFields = findAllFormValues(formData, (name) =>
    name.includes("subcategories-variation")
  );
  const variationTagFields = findAllFormValues(formData, (name) =>
    name.includes("tags-variation")
  );
  //assume that the number of color fields and url fields accurately reflects the number of variations on the design
  if (variationColorFields.length !== variationUrlFields.length)
    throw new Error(
      "Unequal lengths of design variation fields. This is a bug."
    );

  const extracted: {
    id: number;
    imageUrl: string;
    colorId: number;
    subcategoryIds: number[];
    tagIds: number[];
  }[] = [];
  const totalVariations = variationColorFields.length;

  for (let i = 0; i < totalVariations; i++) {
    const colorField = variationColorFields[i];
    if (colorField === undefined) break;

    const variationId = +`${colorField.fieldName.match(/\d+$/)}`;
    if (isNaN(variationId)) break;

    const matchingUrlField = variationUrlFields.find((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    const matchingCategoryFields = variationCategoryFields.filter((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    const matchingTagFields = variationTagFields.filter((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    extracted.push({
      id: variationId,
      colorId: +colorField.fieldValue,
      imageUrl: matchingUrlField ? `${matchingUrlField.fieldValue}` : "",
      subcategoryIds: matchingCategoryFields.map((field) => +field.fieldValue),
      tagIds: matchingTagFields.map((field) => +field.fieldValue),
    });
  }

  return extracted;
}

export function validateDesignFormData(formData: FormData) {
  const existingDesignId = formData.get("existingDesignId");
  const existingDesignIdNum = existingDesignId ? +existingDesignId : undefined;
  const date = new Date(`${formData.get("date")}`);
  const priority = +`${formData.get("priority")}`;
  const variationData = existingDesignId
    ? extractDesignVariationFormData(formData)
    : [];

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
    priority: !isNaN(priority) ? priority : undefined,
    variationData,
  });
}

export function validateQuoteRequest(json: any) {
  return quoteRequestSchema.parse(json);
}

export function validatePricingRequest(json: any) {
  return calculatePriceParamsSchema.parse(json);
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

export function parseHubSpotOwnerResults(json: any) {
  return z.object({ results: z.array(hubSpotOwnerSchema) }).parse(json);
}

export function parseWooCommerceProduct(json: any) {
  return wooCommerceProductSchema.parse(json);
}

export async function parseWooCommerceWebhookRequest(req: NextRequest) {
  const body = await req.json();
  const data = {
    headers: {
      webhookSource: req.headers.get("x-wc-webhook-source"),
      webhookEvent: req.headers.get("x-wc-webhook-event"),
      webhookResource: req.headers.get("x-wc-webhook-resource"),
    },
    body,
  };
  return wooCommerceWebhookRequestSchema.parse(data);
}

function parseWooCommerceLineItem(lineItem: any) {
  //the data that comes from WC is very messy and deeply nested.
  //this helper function can be used to pull data from each line item
  //and restructure it in a more helpful way.
  const quantity = lineItem.quantity;
  const total = lineItem.total;
  const totalTax = lineItem.total_tax;

  return wooCommerceLineItemSchema.parse({
    id: lineItem.id,
    name: lineItem.name,
    quantity,
    total,
    totalTax,
  });
}

export function parseWooCommerceOrderJson(json: any) {
  const lineItemsUnparsed: any[] = json["line_items"];
  if (!lineItemsUnparsed) {
    console.error("No line items array in WC order");
    throw new Error();
  }
  const lineItemsParsed = lineItemsUnparsed.map((item) =>
    parseWooCommerceLineItem(item)
  );

  json.lineItems = lineItemsParsed;
  json.totalTax = json.total_tax;
  json.feeLines = json.fee_lines;
  json.shippingTotal = json.shipping_total;

  return wooCommerceOrderDataSchema.parse(json);
}

export function validateWorkflowFormData(formData: FormData) {
  const existingWorkflowId = formData.get("existingWorkflowId");
  const allStepNames = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-name/)
  );
  const allActionTypes = findAllFormValues(formData, (name) =>
    name.includes("actionType")
  );
  const allActionTargets = findAllFormValues(formData, (name) =>
    name.includes("actionTarget")
  );
  const allActionMessages = findAllFormValues(formData, (name) =>
    name.includes("actionMessage")
  );
  const allProceedImmediately = findAllFormValues(formData, (name) =>
    name.includes("proceedImmediately")
  );
  const allListenerNames = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-name/)
  );
  const allListenerTypes = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-type/)
  );
  const allListenerFrom = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d+-listener-\d+-from/)
  );
  const allListenerGoto = findAllFormValues(
    formData,
    (name) => !!name.match(/step-\d-listener-\d+-goto/)
  );

  const stepIds = allActionTypes.map(
    (field) => +`${field.fieldName.match(/\d+/)}`
  );
  const steps = stepIds.map((id) => {
    const allListenerIdsThisStep = allListenerNames
      .filter((field) => field.fieldName.includes(`step-${id}`))
      .map(
        (field) => +`${field.fieldName.match(`(?<=step-${id}-listener-)\\d+`)}`
      );
    return {
      id,
      name: allStepNames
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionType: allActionTypes
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionTarget: allActionTargets
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      actionMessage: allActionMessages
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      proceedImmediatelyTo: allProceedImmediately
        .find((field) => field.fieldName.includes(`${id}`))
        ?.fieldValue.toString(),
      proceedListeners: allListenerIdsThisStep.map((listenerId) => ({
        id: listenerId,
        name: allListenerNames
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-name`)
          )
          ?.fieldValue.toString(),
        type: allListenerTypes
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-type`)
          )
          ?.fieldValue.toString(),
        from: allListenerFrom
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-from`)
          )
          ?.fieldValue.toString(),
        goto: allListenerGoto
          .find((field) =>
            field.fieldName.match(`step-${id}-listener-${listenerId}-goto`)
          )
          ?.fieldValue.toString(),
      })),
    };
  });

  return {
    existingWorkflowId: existingWorkflowId ? +existingWorkflowId : undefined,
    steps,
  };
}

function validateArray<T>(requiredValues: T[], inputArray: T[]) {
  for (const required of requiredValues) {
    const found = !!inputArray.find((inputVal) => inputVal === required);
    if (!found) return false;
  }
  return true;
}
