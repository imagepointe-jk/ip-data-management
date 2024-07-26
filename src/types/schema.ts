import { z } from "zod";

export const userFormDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  existingUserId: z.number().optional(),
});

const designVariationFormDataSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  colorId: z.number(),
  subcategoryIds: z.array(z.number()),
  tagIds: z.array(z.number()),
});

export const designFormDataSchema = z.object({
  designNumber: z.string(),
  description: z.string(),
  featured: z.boolean(),
  date: z.date().optional(),
  status: z.string(),
  subcategoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  designTypeId: z.string(),
  defaultBackgroundColorId: z.string(),
  imageUrl: z.string(),
  existingDesignId: z.number().optional(),
  priority: z.number().optional(),
  variationData: z.array(designVariationFormDataSchema),
});

const quoteRequestItemSchema = z.object({
  designId: z.number(),
  variationId: z.number().optional(),
  designNumber: z.string(),
  garmentColor: z.string(),
});

export const quoteRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.number(),
  union: z.string(),
  comments: z.string(),
  items: z.array(quoteRequestItemSchema),
});

const productTypes = [
  "tshirt",
  "polo",
  "jacket",
  "sweats",
  "hat",
  "beanie",
] as const;
const productCalcTypeSchema = z.enum(productTypes);
const decorationTypes = ["Screen Print", "Embroidery"] as const;
const decorationLocationSchema = z.object({
  colorCount: z.number().optional(),
  stitchCount: z.number().optional(),
});
export const calculatePriceParamsSchema = z.object({
  productData: z.object({
    type: productCalcTypeSchema,
    net: z.number(),
    isAllPoly: z.boolean().optional(),
    isSweatshirt: z.boolean().optional(),
  }),
  decorationType: z.enum(decorationTypes),
  quantities: z.array(z.number()),
  locations: z.array(decorationLocationSchema),
});

const excelSerialDate = z.number().transform((val) => {
  // Excel serial date starts from January 1, 1900 (excluding leap year bug)
  const excelStartDate = new Date("1899-12-30T00:00:00Z");

  // Adjust for the 1900 leap year bug in Excel
  if (val > 59) {
    val++;
  }

  // Convert days to milliseconds
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  // Calculate the equivalent JavaScript date
  const jsDate = new Date(excelStartDate.getTime() + val * millisecondsPerDay);

  return jsDate;
});

export const customerSchema = z.object({
  ["Customer Number"]: z.number(),
  ["Agent #1"]: z.number().optional(),
  ["Customer Name"]: z.string(),
  ["Street Address"]: z.string().optional(),
  ["Address Line 2"]: z.string().optional(),
  ["City"]: z.string().optional(),
  ["State"]: z.string().optional(),
  ["Zip Code"]: z.coerce.string().optional(),
  ["Country"]: z.string().optional(),
  ["Phone#"]: z.coerce.string().optional(),
});

export const contactSchema = z.object({
  ["Customer Number"]: z.number(),
  ["Address Code"]: z.number().optional(),
  ["Name"]: z.string(),
  ["Address Line 2"]: z.string().optional(),
  ["City"]: z.string().optional(),
  ["State"]: z.string().optional(),
  ["Zip Code"]: z.coerce.string().optional(),
  ["Country"]: z.string().optional(),
  ["Phone#"]: z.string().optional(),
  ["Fax#"]: z.string().optional(),
  ["Email"]: z.string().email(),
});

export const orderSchema = z.object({
  ["Customer Number"]: z.number(),
  ["Sales Order Type"]: z.string().optional(),
  ["Sales Order#"]: z.string(),
  ["Entered Date"]: excelSerialDate.optional(),
  ["Request Date"]: excelSerialDate.optional(),
  ["Cancel Date"]: excelSerialDate.optional(),
  ["Customer PO#"]: z.string().optional(),
  ["Agent Name#1"]: z.string().optional(),
  ["Purchaser"]: z.string().optional(),
  ["Buyer E-Mail"]: z.string().email().optional(),
  ["Shipping $Cost"]: z.number().optional(),
  ["Tax $Total"]: z.number().optional(),
  ["Order $Total"]: z.number().optional(),
  ["Order $Cost"]: z.number().optional(),
  ["Shorted"]: z.enum(["X"]).optional(),
  ["Commission Amount"]: z.number().optional(),
  ["Invoice Date"]: excelSerialDate.optional(),
  ["Internal Comments"]: z.string().optional(),
  ["Comments"]: z.string().optional(),
  ["Ship Via"]: z.string().optional(),
  ["Garment Design"]: z.string().optional(),
  ["Garment Design Description"]: z.string().optional(),
  ["Garment Design Instructions"]: z.string().optional(),
  ["Pipeline"]: z.string().optional(),
  ["Deal Stage"]: z.string().optional(),
  ["PO#"]: z.string().optional(),
  ["HubSpot Owner ID"]: z.string().optional(),
});

export const lineItemSchema = z.object({
  ["Entered Date"]: excelSerialDate.optional(),
  ["Size"]: z.string().optional(),
  ["Size Qty Ordered"]: z.number().optional(),
  ["Size Cost"]: z.number().optional(),
  ["Unit Price"]: z.number().optional(),
  ["SKU#"]: z.string().optional(), //comes from impress
  ["SKU"]: z.string().optional(), //filled with Item# if it's defined, otherwise SKU#
  ["Item#"]: z.string().optional(), //comes from impress
  ["Name"]: z.string().optional(), //product name found from product spreadsheet based on "SKU" field
  ["Sales Order#"]: z.string(),
});

export const poSchema = z.object({
  ["Sales Order#"]: z.coerce.string(),
  ["PO#"]: z.string().optional(),
});

export const productSchema = z.object({
  ["Name"]: z.string().optional(),
  ["SKU"]: z.string(),
  ["Product Type"]: z.string().optional(),
  ["Unit Price"]: z.number().optional(),
});

export const hubSpotOwnerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const wooCommerceProductSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const wooCommerceWebhookRequestSchema = z.object({
  headers: z.object({
    webhookSource: z.string(),
    webhookEvent: z.string(),
    webhookResource: z.string(),
  }),
  body: z.object({
    id: z.number(),
    billing: z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
    }),
  }),
});

export const wooCommerceLineItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantity: z.number(),
  total: z.string(),
  totalTax: z.string(),
});

export const wooCommerceFeeLineSchema = z.object({
  id: z.number(),
  name: z.string(),
  total: z.string(),
});

//WC returns a lot of order data. only include what's necessary in the schema.
export const wooCommerceOrderDataSchema = z.object({
  id: z.number(),
  subtotal: z.string(), //created during validation by summing the pre-tax totals of each line item
  total: z.string(),
  totalTax: z.string(),
  shippingTotal: z.string(),
  lineItems: z.array(wooCommerceLineItemSchema),
  feeLines: z.array(wooCommerceFeeLineSchema),
  dateCreated: z.date(),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
  }),
});

export const orderWorkflowUserRoles = ["approver", "purchaser"] as const;
const orderWorkflowUserRoleSchema = z.enum(orderWorkflowUserRoles);
export const orderWorkflowActionTypes = [
  "email",
  "mark workflow approved",
  "mark workflow denied",
  "cancel woocommerce order",
] as const;
const orderWorkflowActionTypeSchema = z.enum(orderWorkflowActionTypes);
export const orderWorkflowEventTypes = ["approve", "deny", "proceed"] as const;
const orderWorkflowEventTypeSchema = z.enum(orderWorkflowEventTypes);

export const webstoreFormDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  orgName: z.string(),
  url: z.string(),
  changeApiKey: z.string(),
  changeApiSecret: z.string(),
});

export const sortingTypes = ["Design Number", "Priority", "Date"] as const;
export const sortingTypeSchema = z.enum(sortingTypes);

export const sortingDirections = ["Ascending", "Descending"] as const;
export const sortingDirectionSchema = z.enum(sortingDirections);

export type SortingType = z.infer<typeof sortingTypeSchema>;
export type SortingDirection = z.infer<typeof sortingDirectionSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export type DecorationLocation = z.infer<typeof decorationLocationSchema>;
export type CalculatePriceParams = z.infer<typeof calculatePriceParamsSchema>;
export type ProductCalcType = z.infer<typeof productCalcTypeSchema>;

export type Customer = z.infer<typeof customerSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Product = z.infer<typeof productSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type PO = z.infer<typeof poSchema>;
export type HubSpotOwner = z.infer<typeof hubSpotOwnerSchema>;
export type ImpressDataType =
  | "Customer"
  | "Contact"
  | "Order"
  | "Line Item"
  | "PO"
  | "Product";
export type OrderWorkflowUserRole = z.infer<typeof orderWorkflowUserRoleSchema>;
export type OrderWorkflowActionType = z.infer<
  typeof orderWorkflowActionTypeSchema
>;
export type OrderWorkflowEventType = z.infer<
  typeof orderWorkflowEventTypeSchema
>;

//associates the ID of the company resource that got created in HubSpot with the Impress customer number
export type CompanyResource = {
  hubspotId: number;
  customerNumber: number;
};

//associates the ID of the contact resource that got created in HubSpot with the Impress contact email. Note that this is not a reliable association yet because many historical contacts have no listed email.
export type ContactResource = {
  hubspotId: number;
  email: string;
  companyId?: number;
};

//associates the ID of the deal resource that got created in HubSpot with the Impress sales order#.
export type DealResource = {
  hubspotId: number;
  salesOrderNum: string;
  companyId?: number;
  contactId?: number;
};

//associates the ID of the product resource that got created in HubSpot with the Impress SKU
export type ProductResource = {
  hubspotId: number;
  sku: string;
};

export type WooCommerceProduct = z.infer<typeof wooCommerceProductSchema>;
export type WooCommerceOrder = z.infer<typeof wooCommerceOrderDataSchema>;
