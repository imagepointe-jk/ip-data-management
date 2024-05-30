import {
  CompanyResource,
  Contact,
  ContactResource,
  Customer,
  DealResource,
  HubSpotOwner,
  ProductResource,
} from "@/types/schema";
import { SyncError } from "./error";
import { parseHubSpotOwnerResults } from "@/types/validations";
import { mapContactToContact, mapCustomerToCompany } from "./mapData";

const accessToken = () => {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken)
    throw new SyncError(
      "Environment",
      undefined,
      undefined,
      "No HubSpot access token!"
    );
  return accessToken;
};

const standardHeaders = () => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${accessToken()}`);
  return headers;
};

export async function getAllOwners(): Promise<HubSpotOwner[]> {
  const headers = standardHeaders();
  headers.delete("Content-Type");

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  //HubSpot currently imposes a hard limit of 500 owners per request.
  //assume the company has less than 500 owners in HubSpot.
  const response = await fetch(
    "https://api.hubapi.com/crm/v3/owners/?limit=500",
    requestOptions
  );
  if (!response.ok) return [];

  const json = await response.json();
  const parsed = parseHubSpotOwnerResults(json);
  return parsed.results;
}

export async function getAllCompanies() {
  return getAllHubSpotResource(
    "https://api.hubapi.com/crm/v3/objects/companies/?limit=100&properties=customer_number",
    (result) => {
      const companyResource: CompanyResource = {
        hubspotId: result.id,
        customerNumber: +result.properties.customer_number,
      };
      return companyResource;
    }
  );
}

export async function getAllContacts() {
  return getAllHubSpotResource(
    "https://api.hubapi.com/crm/v3/objects/contacts/?limit=100&properties=email",
    (result) => {
      const contactResource: ContactResource = {
        hubspotId: result.id,
        email: result.properties.email,
      };
      return contactResource;
    }
  );
}

export async function getAllDeals() {
  return getAllHubSpotResource(
    "https://api.hubapi.com/crm/v3/objects/deals/?limit=100&properties=dealname",
    (result) => {
      const dealResource: DealResource = {
        hubspotId: result.id,
        salesOrderNum: result.properties.dealname,
      };
      return dealResource;
    }
  );
}

export async function getAllProducts() {
  return getAllHubSpotResource(
    "https://api.hubapi.com/crm/v3/objects/products/?limit=100&properties=hs_sku",
    (result) => {
      const productResource: ProductResource = {
        hubspotId: result.id,
        sku: result.properties.hs_sku,
      };
      return productResource;
    }
  );
}

export function postCustomerAsCompany(customer: Customer) {
  const headers = standardHeaders();

  const raw = JSON.stringify({
    properties: mapCustomerToCompany(customer),
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
  };

  return fetch(
    "https://api.hubapi.com/crm/v3/objects/companies",
    requestOptions
  );
}

export function updateCompanyWithCustomer(
  hubspotId: number,
  customer: Customer
) {
  const headers = standardHeaders();

  const raw = JSON.stringify({
    properties: mapCustomerToCompany(customer),
  });

  const requestOptions = {
    method: "PATCH",
    headers: headers,
    body: raw,
  };

  return fetch(
    `https://api.hubapi.com/crm/v3/objects/companies/${hubspotId}`,
    requestOptions
  );
}

export function postContact(contact: Contact) {
  const headers = standardHeaders();

  const raw = JSON.stringify({
    properties: mapContactToContact(contact),
  });

  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
  };

  return fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts",
    requestOptions
  );
}

export async function getAllHubSpotResource<T>(
  initialUrl: string,
  pullResultData: (result: any) => T
): Promise<T[]> {
  let resources: T[] = [];
  let url = initialUrl;
  for (let i = 0; i < 9999; i++) {
    const headers = standardHeaders();
    const requestOptions = {
      method: "GET",
      headers,
    };
    const response = await fetch(url, requestOptions);

    if (!response.ok) continue;
    const json = await response.json();
    const results = json.results;
    if (!Array.isArray(results)) continue;
    const resourcesThisPass: T[] = results.map(pullResultData);
    resources = [...resources, ...resourcesThisPass];
    if (json.paging === undefined) break;
    url = json.paging.next.link;
  }
  return resources;
}
