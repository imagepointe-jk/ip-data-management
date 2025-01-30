import { doSync } from "@/dignity-apparel/sync/products/products";

export async function POST() {
  console.log("DA Product Sync: Process triggered.");
  doSync();
  return new Response();
}
