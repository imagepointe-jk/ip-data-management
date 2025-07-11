import { z } from "zod";

export const wooCommerceProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  weight: z.string(),
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
    })
  ),
  permalink: z.string(),
});

export const wooCommerceDAProductVariationSchema = z.object({
  id: z.string(),
  databaseId: z.number(),
  name: z.string(),
  sku: z.string(),
  stockQuantity: z.number(),
});

export const wooCommerceDAProductSchema = z.object({
  id: z.string(),
  databaseId: z.number(),
  name: z.string(),
  sku: z.string(),
  status: z.string(),
  globalAttributes: z.array(
    z.object({
      name: z.string(),
      terms: z.array(z.object({ slug: z.string() })),
    })
  ),
  variations: z.array(wooCommerceDAProductVariationSchema),
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
  price: z.number(),
  productId: z.number(),
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
  customerNote: z.string(),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    phone: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string(),
  }),
  shippingLines: z.array(
    z.object({
      id: z.number(),
      method_title: z.string(),
    })
  ),
  metaData: z.array(
    z.object({ id: z.number(), key: z.string(), value: z.string() })
  ),
});

export type WooCommerceProduct = z.infer<typeof wooCommerceProductSchema>;
export type WooCommerceOrder = z.infer<typeof wooCommerceOrderDataSchema>;
export type WooCommerceDAProduct = z.infer<typeof wooCommerceDAProductSchema>;
export type WooCommerceASIProductUpdateData = {
  priceBreaks?: {
    break1?: {
      quantity: string;
      price: string;
    };
    break2?: {
      quantity: string;
      price: string;
    };
    break3?: {
      quantity: string;
      price: string;
    };
    break4?: {
      quantity: string;
      price: string;
    };
    break5?: {
      quantity: string;
      price: string;
    };
  };
};
