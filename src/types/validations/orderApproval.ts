import { z } from "zod";

export function validateOrderApprovalIframeData(data: any) {
  return z.object({ url: z.string(), searchParams: z.string() }).parse(data);
}
