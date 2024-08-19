import { z } from "zod";
import { orderApprovalServerDataSchema } from "../schema";

export function validateOrderApprovalIframeData(data: any) {
  return z.object({ url: z.string(), searchParams: z.string() }).parse(data);
}

export function validateOrderApprovalServerData(data: any) {
  return orderApprovalServerDataSchema.parse(data);
}
