"use server";

import { validateHubSpotSyncFormData } from "@/types/validations";

export async function startSync(formData: FormData) {
  const { customers, contacts, lineItems, orders, po, products } =
    await validateHubSpotSyncFormData(formData);

  console.log("validation passed===================================");
}
