import { z } from "zod";

const parentWindowDataSchema = z.object({
  origin: z.string(),
  pathname: z.string(),
  search: z.string(),
  href: z.string(),
});
export type ParentWindowData = z.infer<typeof parentWindowDataSchema>;

export function validateResponseData(data: any) {
  return parentWindowDataSchema.parse(data);
}
