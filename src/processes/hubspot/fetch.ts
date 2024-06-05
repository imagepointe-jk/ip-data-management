import {
  CompanyResource,
  Contact,
  ContactResource,
  Customer,
  DealResource,
  HubSpotOwner,
  Order,
  Product,
  ProductResource,
} from "@/types/schema";
import { SyncError } from "./error";
import { parseHubSpotOwnerResults } from "@/types/validations";
import {
  mapContactToContact,
  mapCustomerToCompany,
  mapOrderToDeal,
  mapProductToProduct,
} from "./mapData";
import {
  HUBSPOT_CONTACT_TO_COMPANY,
  HUBSPOT_DEAL_TO_COMPANY,
  HUBSPOT_DEAL_TO_CONTACT,
} from "@/constants";

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
    "https://api.hubapi.com/crm/v3/objects/contacts/?limit=100&properties=email&associations=companies",
    (result) => {
      const contactResource: ContactResource = {
        hubspotId: result.id,
        email: result.properties.email,
        companyId: result.associations
          ? result.associations.companies.results[0].id
          : undefined,
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
        companyId: result.associations?.companies?.results[0].id,
        contactId: result.associations?.contacts?.results[0].id,
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

  //TODO: ensure customer number is not modified when updating
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

export function postContact(contact: Contact, associatedCompanyId?: number) {
  const headers = standardHeaders();

  const raw = JSON.stringify({
    properties: mapContactToContact(contact),
    associations: associatedCompanyId
      ? [
          {
            to: {
              id: associatedCompanyId,
            },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: HUBSPOT_CONTACT_TO_COMPANY,
              },
            ],
          },
        ]
      : undefined,
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

export function updateContact(contactId: number, contactData: Contact) {
  const myHeaders = standardHeaders();

  const mappedData = mapContactToContact(contactData);
  const raw = JSON.stringify({
    properties: { ...mappedData, email: undefined },
  });

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
  };

  return fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
    requestOptions
  );
}

type AssociationType = "companies" | "contacts" | "deals";
export function associateHubSpotResources(params: {
  from: {
    type: AssociationType;
    id: number;
  };
  to: {
    type: AssociationType;
    id: number;
  };
}) {
  const { from, to } = params;
  const myHeaders = standardHeaders();

  const raw = JSON.stringify({
    inputs: [
      {
        from: {
          id: `${from.id}`,
        },
        to: {
          id: `${to.id}`,
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  return fetch(
    `https://api.hubapi.com/crm/v4/associations/${from.type}/${to.type}/batch/associate/default`,
    requestOptions
  );
}

export function postOrderAsDeal(
  order: Order,
  associatedCompanyId?: number,
  associatedContactId?: number
) {
  const myHeaders = standardHeaders();

  const associations: any[] = [];

  if (associatedCompanyId) {
    associations.push({
      to: {
        id: associatedCompanyId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: HUBSPOT_DEAL_TO_COMPANY,
        },
      ],
    });
  }

  if (associatedContactId) {
    associations.push({
      to: {
        id: associatedContactId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: HUBSPOT_DEAL_TO_CONTACT,
        },
      ],
    });
  }

  const raw = JSON.stringify({
    properties: mapOrderToDeal(order),
    associations: associations.length > 0 ? associations : undefined,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  return fetch("https://api.hubapi.com/crm/v3/objects/deals", requestOptions);
}

export function updateDealWithOrder(dealId: number, orderData: Order) {
  const myHeaders = standardHeaders();

  const mappedData = mapOrderToDeal(orderData);
  const raw = JSON.stringify({
    properties: { ...mappedData, dealname: undefined },
  });

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
  };

  return fetch(
    `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
    requestOptions
  );
}

export function postProduct(product: Product) {
  const headers = standardHeaders();

  const raw = JSON.stringify({
    properties: mapProductToProduct(product),
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
  };

  return fetch(
    "https://api.hubapi.com/crm/v3/objects/products",
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
