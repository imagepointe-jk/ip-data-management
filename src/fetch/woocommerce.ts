import { env } from "@/env";
import { AppError } from "@/error";
import { TaxImportRow } from "@/types/schema/tax";
import {
  WooCommerceASIProductUpdateData,
  WooCommerceProduct,
} from "@/types/schema/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations/woo";
import { BAD_REQUEST } from "@/utility/statusCodes";

const standardCredentials = () => {
  const apiKey = process.env.WOOCOMMERCE_MAIN_API_KEY;
  const apiSecret = process.env.WOOCOMMERCE_MAIN_API_SECRET;
  if (!apiKey || !apiSecret)
    throw new Error("Missing WooCommerce credentials!");
  return { apiKey, apiSecret };
};

const standardHeaders = () => {
  const credentials = standardCredentials();
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${credentials.apiKey}:${credentials.apiSecret}`)}`
  );
  return headers;
};

export async function getProductsMultiple(
  ids: number[],
  storeUrl = "https://www.imagepointe.com",
  key?: string,
  secret?: string
) {
  const responses = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await getProduct(id, storeUrl, key, secret);
        if (!response.ok) {
          throw new Error(
            `Status ${response.status} while getting product id ${id}`
          );
        }
        const json = await response.json();
        return parseWooCommerceProduct(json);
      } catch (error) {
        console.error(`Error getting WooCommerce product: ${error}`);
        return null;
      }
    })
  );

  const nonNull: WooCommerceProduct[] = [];
  for (const r of responses) {
    if (r !== null) nonNull.push(r);
  }

  return nonNull;
}

//this is being called from the front end, but only in the admin area,
//so exposed credentials are not currently a concern
export async function getProduct(
  id: number,
  storeUrl = "https://www.imagepointe.com",
  key?: string,
  secret?: string
) {
  const headers = standardHeaders();
  if (key && secret) {
    headers.set("Authorization", `Basic ${btoa(`${key}:${secret}`)}`);
  }

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/products/${id}`, requestOptions);
}

export async function getOrder(
  id: number,
  storeUrl: string,
  storeKey: string,
  storeSecret: string
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );
  headers.append("Cache-Control", "no-store");

  const requestOptions = {
    method: "GET",
    headers,
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/orders/${id}`, {
    ...requestOptions,
    cache: "no-store",
  });
}

export type OrderUpdateData = {
  id: number;
  customer_note: string;
  shipping: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  line_items: { id: number; quantity?: number; total?: string }[];
  shipping_lines: { id: number; method_title: string }[];
  meta_data: { id: number; key: string; value: string }[];
};
export async function updateOrder(
  storeUrl: string,
  storeKey: string,
  storeSecret: string,
  data: OrderUpdateData
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );

  const requestOptions = {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(data),
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/orders/${data.id}`, requestOptions);
}

export async function addMetaDataToOrder(
  orderId: number,
  storeUrl: string,
  storeKey: string,
  storeSecret: string,
  data: { key: string; value: string }[]
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      meta_data: data,
    }),
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/orders/${orderId}`, requestOptions);
}

export async function setOrderStatus(
  orderId: number,
  storeUrl: string,
  storeKey: string,
  storeSecret: string,
  status: "on-hold" | "processing" | "cancelled"
) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );

  const requestOptions = {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ status }),
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/orders/${orderId}`, requestOptions);
}

export async function getDAProductsGQL() {
  const query = `
  query GetProducts {
    products(first: 1000) {
      nodes {
        id
        databaseId
        name
        sku
        ...on Product {
          status
          globalAttributes {
            edges {
                node {
                    name
                    terms {
                        edges {
                            node {
                                slug
                            }
                        }
                    }
                }
            }
          } 
        }
        ...on VariableProduct {
          variations(first: 1000) {
            nodes {
              id
              databaseId
              name
              sku
              stockQuantity
            }
          }
        }
      }
    }
  }
`;

  return fetch(`${env.DA_WOOCOMMERCE_STORE_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${env.DA_WP_APPLICATION_USERNAME}:${env.DA_WP_APPLICATION_PASSWORD}`
      )}`,
    },
    body: JSON.stringify({
      query,
    }),
  });
}

export async function updateDAProductVariationStock(
  productId: number,
  variationId: number,
  stockQuantity: number,
  price: number
) {
  return fetch(
    `${env.DA_WOOCOMMERCE_STORE_URL}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
    {
      method: "POST",
      body: JSON.stringify({
        stock_quantity: stockQuantity,
        regular_price: `${price}`,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(
          `${env.DA_WP_APPLICATION_USERNAME}:${env.DA_WP_APPLICATION_PASSWORD}`
        )}`,
      },
    }
  );
}

export async function updateIPProduct(
  id: number,
  data: WooCommerceASIProductUpdateData
) {
  const { priceBreaks } = data;
  const meta_data: { key: string; value: string }[] = [];

  if (priceBreaks) {
    const { break1, break2, break3, break4, break5 } = priceBreaks;
    if (break1) {
      meta_data.push({ key: "promo_quantity_1", value: break1.quantity });
      meta_data.push({ key: "promo_price_1", value: break1.price });
    }

    if (break2) {
      meta_data.push({ key: "promo_quantity_2", value: break2.quantity });
      meta_data.push({ key: "promo_price_2", value: break2.price });
    }
    if (break3) {
      meta_data.push({ key: "promo_quantity_3", value: break3.quantity });
      meta_data.push({ key: "promo_price_3", value: break3.price });
    }
    if (break4) {
      meta_data.push({ key: "promo_quantity_4", value: break4.quantity });
      meta_data.push({ key: "promo_price_4", value: break4.price });
    }
    if (break5) {
      meta_data.push({ key: "promo_quantity_5", value: break5.quantity });
      meta_data.push({ key: "promo_price_5", value: break5.price });
    }
  }

  const body = {
    meta_data,
  };

  return fetch(`${env.IP_WOOCOMMERCE_STORE_URL}/wp-json/wc/v3/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${env.IP_WP_APPLICATION_USERNAME}:${env.IP_WP_APPLICATION_PASSWORD}`
      )}`,
    },
    body: JSON.stringify(body),
  });
}

export async function searchIPProducts(search: string) {
  return fetch(
    `${env.IP_WOOCOMMERCE_STORE_URL}/wp-json/wc/v3/products?search=${search}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(
          `${env.IP_WP_APPLICATION_USERNAME}:${env.IP_WP_APPLICATION_PASSWORD}`
        )}`,
      },
    }
  );
}

export async function getTaxRates(params: {
  storeUrl: string;
  storeKey: string;
  storeSecret: string;
}) {
  const { storeKey, storeSecret, storeUrl } = params;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );

  const requestOptions = {
    method: "GET",
    headers,
  };

  let TEMP_SAFETY_MAX = 10;
  let jsonArray: any[] = [];
  for (let i = 0; true; i++) {
    if (i > TEMP_SAFETY_MAX) break;
    console.log(`request ${i}`);

    const url = `${storeUrl}/wp-json/wc/v3/taxes?page=${i + 1}&per_page=100`;
    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok)
        throw new AppError({
          type: "Client Request",
          clientMessage: `Failed to fetch tax rates with URL ${url}. Status code ${response.status}.`,
          serverMessage: `Failed to fetch tax rates with URL ${url}. Status code ${response.status}.`,
          statusCode: BAD_REQUEST,
        });
      const json = await response.json();
      if (Array.isArray(json)) {
        jsonArray = jsonArray.concat(json);
      }
    } catch (error) {
      throw new AppError({
        type: "Unknown",
        clientMessage: `${error}`,
        serverMessage: `${error}`,
      });
    }
  }

  return jsonArray;
}

export async function createTaxRate(params: {
  storeUrl: string;
  storeKey: string;
  storeSecret: string;
  row: TaxImportRow;
}) {
  const { storeKey, storeSecret, storeUrl, row } = params;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "Authorization",
    `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
  );

  const raw = JSON.stringify({
    country: "US",
    state: row.State.toLocaleUpperCase(),
    postcode: `${row.Zip}`,
    city: row.City.toLocaleUpperCase(),
    rate: row.Rate.toFixed(4),
    name: row.TaxName,
    class: row.Class.toLocaleLowerCase(),
    shipping: false,
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: raw,
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/taxes`, requestOptions);
}
