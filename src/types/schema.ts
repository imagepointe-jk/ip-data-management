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
  date: z.date().optional(),
  status: z.string(),
  subcategoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  designTypeId: z.string(),
  defaultBackgroundColorId: z.string(),
  imageUrl: z.string(),
  existingDesignId: z.number().optional(),
});

export const sortingTypes = ["Design Number"] as const;
export const sortingTypeSchema = z.enum(sortingTypes);

export const sortingDirections = ["Ascending", "Descending"] as const;
export const sortingDirectionSchema = z.enum(sortingDirections);

export type SortingType = z.infer<typeof sortingTypeSchema>;
export type SortingDirection = z.infer<typeof sortingDirectionSchema>;
