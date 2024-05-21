import {
  completeHubSpotSync,
  createHubSpotSync,
  updateHubSpotSyncProgress,
} from "@/db/access/hubspot";
import { WorkSheet } from "xlsx";

export async function hubSpotSync(
  customers: WorkSheet,
  contacts: WorkSheet,
  orders: WorkSheet,
  po: WorkSheet,
  products: WorkSheet,
  lineItems: WorkSheet,
  userEmail: string
) {
  console.log("==============STARTED HUBSPOT SYNC=================");
  const sync = await createHubSpotSync(userEmail);

  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.1);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.2);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.3);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.4);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.5);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.6);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.7);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.8);
  await waitForMs(1000);
  await updateHubSpotSyncProgress(sync.id, 0.9);
  await waitForMs(1000);
  await completeHubSpotSync(sync.id);

  console.log("==============FINISHED HUBSPOT SYNC=================");
}

function waitForMs(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
