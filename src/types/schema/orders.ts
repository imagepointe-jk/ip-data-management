import { z } from "zod";

export const orderImportSchema = z.object({
  id: z.string().optional(),
  shipping: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    method: z.string().optional(),
  }),
  billing: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  lineItems: z.array(
    z.object({
      productId: z.number().optional(),
      variationId: z.number().optional(),
      sku: z.string().optional(),
      quantity: z.number().optional(),
    }),
  ),
  customerNote: z.string().optional(),
  couponCode: z.string().optional(),
});

export type OrderImportDTO = z.infer<typeof orderImportSchema>;
