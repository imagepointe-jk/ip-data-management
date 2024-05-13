import { z } from "zod";

export const userFormDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  existingUserId: z.number().optional(),
});
