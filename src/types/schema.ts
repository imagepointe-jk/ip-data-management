import { z } from "zod";

export const userFormDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  existingUserId: z.number().optional(),
});

export const designFormDataSchema = z.object({
  designNumber: z.string(),
  description: z.string(),
  featured: z.boolean(),
  date: z.date(),
  status: z.string(),
  subcategoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  designTypeId: z.string(),
  defaultBackgroundColorId: z.string(),
  existingDesignId: z.number().optional(),
});
