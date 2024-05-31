import { completeHubSpotSync, createHubSpotSync } from "@/db/access/hubspot";
import {
  CompanyResource,
  Contact,
  ContactResource,
  Customer,
} from "@/types/schema";
import { WorkSheet } from "xlsx";
import { DataError, SyncError, SyncWarning, gatherAllIssues } from "./error";
import { handleData as handleInputData } from "./handleData";
import { getHubspotState } from "./hubspotState";
import {
  associateContactWithCompany,
  postContact,
  postCustomerAsCompany,
  updateCompanyWithCustomer,
  updateContact,
} from "./fetch";
import { sendIssuesSheet } from "@/utility/mail";
import { findInAnyArray } from "@/utility/misc";

const syncErrors: SyncError[] = [];
const syncWarnings: SyncWarning[] = [];

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
  const { existingCompanies, existingContacts } = await getHubspotState();
  await syncResources({
    existing: {
      companies: existingCompanies,
      contacts: existingContacts,
    },
    input: {
      customers,
      contacts,
    },
  });
  const issues = gatherAllIssues({
    customers,
    contacts,
    orders,
    lineItems,
    products,
    syncErrors,
    syncWarnings,
  });
  sendIssuesSheet(issues);

  await completeHubSpotSync(sync.id);
  console.log("==============FINISHED HUBSPOT SYNC=================");
}

async function syncResources(data: {
  existing: { companies: CompanyResource[]; contacts: ContactResource[] };
  input: {
    customers: (Customer | DataError)[];
    contacts: (Contact | DataError)[];
  };
}) {
  const { existing, input } = data;

  const syncedCompanies = await syncCustomersAsCompanies(
    input.customers,
    existing.companies
  );
  const syncedContacts = await syncContacts(
    input.contacts,
    existing.contacts,
    existing.companies,
    syncedCompanies
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

async function syncContacts(
  contacts: (Contact | DataError)[],
  existingContacts: ContactResource[],
  existingCompanies: CompanyResource[],
  syncedCompanies: CompanyResource[]
) {
  console.log("Syncing contacts...");
  const syncedContacts: ContactResource[] = [];

  for (const contact of contacts) {
    if (contact instanceof DataError) continue;

    const alreadyInHubSpot = existingContacts.find(
      (existingContact) =>
        existingContact.email.toLocaleLowerCase() ===
        contact.Email.toLocaleLowerCase()
    );

    const associatedCompany = findInAnyArray(
      [existingCompanies, syncedCompanies],
      (company) => company.customerNumber === contact["Customer Number"]
    );

    if (!associatedCompany)
      syncWarnings.push(
        new SyncWarning(
          "Data Integrity",
          `Contact with email ${contact.Email} is associated with customer number ${contact["Customer Number"]}, but the customer/company record could not be found. The association was skipped.`
        )
      );

    try {
      if (!alreadyInHubSpot) {
        if (contact.Email === "jsherman@smart-nerc.org") console.log(1);
        const createResponse = await postContact(
          contact,
          associatedCompany?.hubspotId
        );
        const createJson = await createResponse.json();
        if (!createResponse.ok) {
          throw new SyncError(
            "API",
            "Contact",
            `${contact.Email}`,
            "The POST request to create the contact failed.",
            createResponse.status,
            `${JSON.stringify(createJson)}`
          );
        }
        syncedContacts.push({
          email: contact.Email,
          hubspotId: createJson.id,
          companyId: associatedCompany?.hubspotId,
        });
      } else {
        if (contact.Email === "jsherman@smart-nerc.org") console.log(2);
        const updateResponse = await updateContact(
          alreadyInHubSpot.hubspotId,
          contact
        );
        const updateJson = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new SyncError(
            "API",
            "Contact",
            `${contact.Email}`,
            "The PATCH request to update the contact failed.",
            updateResponse.status,
            `${JSON.stringify(updateJson)}`
          );
        }
        if (contact.Email === "jsherman@smart-nerc.org")
          console.log(
            3,
            alreadyInHubSpot.hubspotId,
            alreadyInHubSpot.companyId,
            associatedCompany
          );
        syncedContacts.push({
          email: alreadyInHubSpot.email,
          hubspotId: alreadyInHubSpot.hubspotId,
          companyId: associatedCompany?.hubspotId,
        });

        if (alreadyInHubSpot.companyId === undefined && associatedCompany) {
          if (contact.Email === "jsherman@smart-nerc.org") console.log(4);
          const associationResponse = await associateContactWithCompany(
            alreadyInHubSpot.hubspotId,
            associatedCompany.hubspotId
          );
          const associationJson = await associationResponse.json();
          if (!associationResponse.ok) {
            throw new SyncError(
              "API",
              "Contact",
              `${contact.Email}`,
              "The POST request to associate the contact with the company failed.",
              associationResponse.status,
              `${JSON.stringify(associationJson)}`
            );
          }
          if (contact.Email === "jsherman@smart-nerc.org") console.log(5);
        }
      }
    } catch (error) {
      if (error instanceof SyncError) syncErrors.push(error);
      else
        syncErrors.push(
          new SyncError(
            "Unknown",
            "Customer",
            `${contact.Email}`,
            error instanceof Error ? error.message : undefined
          )
        );
    }
  }
}
