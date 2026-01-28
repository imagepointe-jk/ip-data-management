import { z } from "zod";

const asiProductImportSchema = z.object({
  sku: z.string(),
  vendorName: z.string(),
  vendorSku: z.string(),
  description: z.string(),
  priceBreaks: z.array(z.object({ quantity: z.string(), price: z.string() })),
});

export const generalProductImportSchema = z.object({
  id: z.number().optional(),
  sku: z.string().optional(),
  stock: z.number().optional(),
  parent: z.string().optional(),
});

export type ASIProductImportData = z.infer<typeof asiProductImportSchema>;
