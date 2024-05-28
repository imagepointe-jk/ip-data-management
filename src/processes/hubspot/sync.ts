import { completeHubSpotSync, createHubSpotSync } from "@/db/access/hubspot";
import { CompanyResource, Customer } from "@/types/schema";
import { WorkSheet } from "xlsx";
import { DataError, SyncError, gatherAllIssues } from "./error";
import { handleData as handleInputData } from "./handleData";
import { getHubspotState } from "./hubspotState";
import { postCustomerAsCompany, updateCompanyWithCustomer } from "./fetch";
import { sendIssuesSheet } from "@/utility/mail";

const syncErrors: SyncError[] = [];

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

  const { customers, contacts, lineItems, orders, po, products } =
    await handleInputData(worksheetInput);
  const { existingCompanies } = await getHubspotState();
  await syncResources({
    existing: {
      companies: existingCompanies,
    },
    input: {
      customers,
    },
  });
  const issues = gatherAllIssues({
    customers,
    contacts,
    orders,
    lineItems,
    products,
    syncErrors,
  });
  sendIssuesSheet(issues);

  await completeHubSpotSync(sync.id);
  console.log("==============FINISHED HUBSPOT SYNC=================");
}

async function syncResources(data: {
  existing: { companies: CompanyResource[] };
  input: { customers: (Customer | DataError)[] };
}) {
  const syncedCompanies = await syncCustomersAsCompanies(
    data.input.customers,
    data.existing.companies
  );
}

async function syncCustomersAsCompanies(
  customers: (Customer | DataError)[],
  existingCompanies: CompanyResource[]
) {
  console.log("Syncing companies...");
  const syncedCompanies: CompanyResource[] = [];

  for (const customer of customers) {
    if (customer instanceof DataError) continue;

    const alreadyInHubSpot = existingCompanies.find(
      (existing) => existing.customerNumber === customer["Customer Number"]
    );
    try {
      const syncFn =
        alreadyInHubSpot !== undefined
          ? () =>
              updateCompanyWithCustomer(alreadyInHubSpot.hubspotId, customer)
          : () => postCustomerAsCompany(customer);

      const response = await syncFn();
      const json = await response.json();
      if (!response.ok)
        throw new SyncError(
          "API",
          "Customer",
          `${customer["Customer Number"]}`,
          "Unknown error",
          response.status,
          `${JSON.stringify(json)}`
        );
      syncedCompanies.push({
        customerNumber: customer["Customer Number"],
        hubspotId: json.id,
      });
    } catch (error) {
      if (error instanceof SyncError) syncErrors.push(error);
      else
        syncErrors.push(
          new SyncError(
            "Unknown",
            "Customer",
            `${customer["Customer Number"]}`,
            error instanceof Error ? error.message : undefined
          )
        );
    }
  }

  return syncedCompanies;
}
