import { completeHubSpotSync, createHubSpotSync } from "@/db/access/hubspot";
import {
  CompanyResource,
  Contact,
  ContactResource,
  Customer,
  DealResource,
  LineItem,
  Order,
  Product,
  ProductResource,
} from "@/types/schema";
import { WorkSheet } from "xlsx";
import { DataError, SyncError, SyncWarning, gatherAllIssues } from "./error";
import { handleData as handleInputData } from "./handleData";
import { getHubspotState } from "./hubspotState";
import {
  associateHubSpotResources,
  postContact,
  postCustomerAsCompany,
  postLineItem,
  postOrderAsDeal,
  postProduct,
  updateCompanyWithCustomer,
  updateContact,
  updateDealWithOrder,
} from "./fetch";
import { sendIssuesSheet } from "@/utility/mail";
import { findInAnyArray } from "@/utility/misc";
import { RESOURCE_CONFLICT } from "@/utility/statusCodes";

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
  const {
    existingCompanies,
    existingContacts,
    existingDeals,
    existingProducts,
  } = await getHubspotState();
  await syncResources({
    existing: {
      companies: existingCompanies,
      contacts: existingContacts,
      deals: existingDeals,
      products: existingProducts,
    },
    input: {
      customers,
      contacts,
      orders,
      products,
      lineItems,
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
  existing: {
    companies: CompanyResource[];
    contacts: ContactResource[];
    deals: DealResource[];
    products: ProductResource[];
  };
  input: {
    customers: (Customer | DataError)[];
    contacts: (Contact | DataError)[];
    orders: (Order | DataError)[];
    products: (Product | DataError)[];
    lineItems: (LineItem | DataError)[];
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
  const syncedDeals = await syncOrdersAsDeals(
    input.orders,
    existing.deals,
    existing.companies,
    syncedCompanies,
    existing.contacts,
    syncedContacts
  );
  const syncedProducts = await syncProducts(input.products, existing.products);
  await syncLineItems(
    input.lineItems,
    existing.deals,
    syncedDeals,
    existing.products,
    syncedProducts
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
        syncedContacts.push({
          email: alreadyInHubSpot.email,
          hubspotId: alreadyInHubSpot.hubspotId,
          companyId: associatedCompany?.hubspotId,
        });

        if (alreadyInHubSpot.companyId === undefined && associatedCompany) {
          const associationResponse = await associateHubSpotResources({
            from: {
              id: alreadyInHubSpot.hubspotId,
              type: "contacts",
            },
            to: {
              id: associatedCompany.hubspotId,
              type: "companies",
            },
          });
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
  return syncedContacts;
}

async function syncOrdersAsDeals(
  orders: (Order | DataError)[],
  existingDeals: DealResource[],
  existingCompanies: CompanyResource[],
  syncedCompanies: CompanyResource[],
  existingContacts: ContactResource[],
  syncedContacts: ContactResource[]
) {
  console.log("Syncing orders...");
  const syncedDeals: DealResource[] = [];

  for (const order of orders) {
    if (order instanceof DataError) continue;

    const alreadyInHubSpot = existingDeals.find(
      (deal) => deal.salesOrderNum === order["Sales Order#"]
    );

    const associatedCompany = findInAnyArray(
      [existingCompanies, syncedCompanies],
      (company) => company.customerNumber === order["Customer Number"]
    );
    const associatedContact = findInAnyArray(
      [existingContacts, syncedContacts],
      (contact) =>
        order["Buyer E-Mail"] !== undefined &&
        contact.email.toLocaleLowerCase() ===
          order["Buyer E-Mail"].toLocaleLowerCase()
    );
    if (!associatedCompany)
      syncWarnings.push(
        new SyncWarning(
          "Data Integrity",
          `Order with sales number ${order["Sales Order#"]} is associated with customer number ${order["Customer Number"]} in the input data, but the customer/company record could not be found. The association was skipped.`
        )
      );
    if (!associatedContact)
      syncWarnings.push(
        new SyncWarning(
          "Data Integrity",
          `Order with sales number ${order["Sales Order#"]} is associated with the contact with email ${order["Buyer E-Mail"]} in the input data, but the contact record could not be found. The association was skipped.`
        )
      );

    try {
      if (!alreadyInHubSpot) {
        const createResponse = await postOrderAsDeal(
          order,
          associatedCompany?.hubspotId,
          associatedContact?.hubspotId
        );
        const createJson = await createResponse.json();
        if (!createResponse.ok) {
          throw new SyncError(
            "API",
            "Order",
            `${order["Sales Order#"]}`,
            "The POST request to create the deal failed.",
            createResponse.status,
            JSON.stringify(createJson)
          );
        }
        syncedDeals.push({
          hubspotId: createJson.id,
          salesOrderNum: order["Sales Order#"],
          companyId: associatedCompany?.hubspotId,
          contactId: associatedContact?.hubspotId,
        });
      } else {
        const updateResponse = await updateDealWithOrder(
          alreadyInHubSpot.hubspotId,
          order
        );
        const updateJson = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new SyncError(
            "API",
            "Order",
            `${order["Sales Order#"]}`,
            "The PATCH request to update the deal failed.",
            updateResponse.status,
            JSON.stringify(updateJson)
          );
        }
        syncedDeals.push({
          hubspotId: alreadyInHubSpot.hubspotId,
          salesOrderNum: alreadyInHubSpot.salesOrderNum,
          companyId: associatedCompany?.hubspotId,
          contactId: associatedContact?.hubspotId,
        });

        //associate updated deal with a company, if not already associated
        if (alreadyInHubSpot.companyId === undefined && associatedCompany) {
          const associationResponse = await associateHubSpotResources({
            from: {
              id: alreadyInHubSpot.hubspotId,
              type: "deals",
            },
            to: {
              id: associatedCompany.hubspotId,
              type: "companies",
            },
          });
          const associationJson = await associationResponse.json();
          if (!associationResponse.ok) {
            throw new SyncError(
              "API",
              "Order",
              order["Sales Order#"],
              "The POST request to associate the deal with the company failed.",
              associationResponse.status,
              JSON.stringify(associationJson)
            );
          }
        }
        //associate updated deal with a contact, if not already associated
        if (alreadyInHubSpot.contactId === undefined && associatedContact) {
          const associationResponse = await associateHubSpotResources({
            from: {
              id: alreadyInHubSpot.hubspotId,
              type: "deals",
            },
            to: {
              id: associatedContact.hubspotId,
              type: "contacts",
            },
          });
          const associationJson = await associationResponse.json();
          if (!associationResponse.ok) {
            throw new SyncError(
              "API",
              "Order",
              order["Sales Order#"],
              "The POST request to associate the deal with the contact failed.",
              associationResponse.status,
              JSON.stringify(associationJson)
            );
          }
        }
      }
    } catch (error) {
      if (error instanceof SyncError) syncErrors.push(error);
      else
        syncErrors.push(
          new SyncError(
            "Unknown",
            "Customer",
            `${order["Sales Order#"]}`,
            error instanceof Error ? error.message : undefined
          )
        );
    }
  }
  return syncedDeals;
}

async function syncProducts(
  products: (Product | DataError)[],
  existingProducts: ProductResource[]
) {
  console.log("Syncing products...");
  const syncedProducts: ProductResource[] = [];

  for (const product of products) {
    if (product instanceof DataError) continue;

    const alreadyInHubSpot = existingProducts.find(
      (existing) => existing.sku === product.SKU
    );

    if (alreadyInHubSpot) continue; //we likely won't need to update existing products

    try {
      const response = await postProduct(product);
      const json = await response.json();
      if (!response.ok)
        throw new SyncError(
          "API",
          "Product",
          product.SKU,
          "The POST request to create the product failed.",
          response.status,
          JSON.stringify(json)
        );
      syncedProducts.push({
        hubspotId: json.id,
        sku: product.SKU,
      });
    } catch (error) {
      if (error instanceof SyncError) syncErrors.push(error);
      else
        syncErrors.push(
          new SyncError(
            "Unknown",
            "Customer",
            product.SKU,
            error instanceof Error ? error.message : undefined
          )
        );
    }
  }

  return syncedProducts;
}

async function syncLineItems(
  lineItems: (LineItem | DataError)[],
  existingDeals: DealResource[],
  syncedDeals: DealResource[],
  existingProducts: ProductResource[],
  syncedProducts: ProductResource[]
) {
  console.log("Syncing line items...");

  for (const lineItem of lineItems) {
    if (lineItem instanceof DataError) continue;

    const identifier = `Line item for SKU ${lineItem.SKU} on deal ${lineItem["Sales Order#"]}`;

    try {
      const associatedExistingDeal = existingDeals.find(
        (deal) => deal.salesOrderNum === lineItem["Sales Order#"]
      );
      const maybeAlreadyInHubspot = associatedExistingDeal !== undefined;
      //May need to implement line items for existing deals
      if (maybeAlreadyInHubspot) {
        throw new SyncError(
          "Data Integrity",
          "Line Item",
          identifier,
          `${identifier} references a deal that already existed in HubSpot before this sync. The line item was skipped to avoid the risk of duplicates..`,
          RESOURCE_CONFLICT
        );
      }

      const associatedDeal = syncedDeals.find(
        (deal) => deal.salesOrderNum === lineItem["Sales Order#"]
      );
      if (!associatedDeal) {
        throw new SyncError(
          "Data Integrity",
          "Line Item",
          identifier,
          `${identifier} references a deal that was not found in HubSpot.`
        );
      }

      const associatedProduct = findInAnyArray(
        [existingProducts, syncedProducts],
        (product) => product.sku === lineItem.SKU
      );
      if (!associatedProduct) {
        throw new SyncError(
          "Data Integrity",
          "Line Item",
          identifier,
          `${identifier} references a product that was not found in HubSpot.`
        );
      }

      const response = await postLineItem(
        lineItem,
        associatedDeal.hubspotId,
        associatedProduct.hubspotId
      );
      const json = await response.json();
      if (!response.ok) {
        throw new SyncError(
          "API",
          "Line Item",
          identifier,
          "The POST request to create the line item failed.",
          response.status,
          JSON.stringify(json)
        );
      }
    } catch (error) {
      if (error instanceof SyncError) syncErrors.push(error);
      else
        syncErrors.push(
          new SyncError(
            "Unknown",
            "Line Item",
            identifier,
            error instanceof Error ? error.message : undefined
          )
        );
    }
  }
}
