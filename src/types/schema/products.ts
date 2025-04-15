import { z } from "zod";

const asiProductImportSchema = z.object({
  sku: z.string(),
  vendorName: z.string(),
  vendorSku: z.string(),
  description: z.string(),
  priceBreaks: z.array(z.object({ quantity: z.string(), price: z.string() })),
});

export type ASIProductImportData = z.infer<typeof asiProductImportSchema>;
