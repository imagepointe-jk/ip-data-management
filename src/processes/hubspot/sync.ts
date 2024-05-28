import {
  completeHubSpotSync,
  createHubSpotSync,
  updateHubSpotSyncProgress,
} from "@/db/access/hubspot";
import { WorkSheet } from "xlsx";
import { handleData as handleInputData } from "./handleData";
import { getHubspotState } from "./hubspotState";

export async function hubSpotSync(worksheetInput: {
  customers: WorkSheet;
  contacts: WorkSheet;
  orders: WorkSheet;
  po: WorkSheet;
  products: WorkSheet;
  lineItems: WorkSheet;
  userEmail: string;
}) {
  console.log("==============STARTED HUBSPOT SYNC=================");
  const sync = await createHubSpotSync(worksheetInput.userEmail);

  const handledInput = await handleInputData(worksheetInput);
  const hubspotState = await getHubspotState();

  await completeHubSpotSync(sync.id);
  console.log("==============FINISHED HUBSPOT SYNC=================");
}
