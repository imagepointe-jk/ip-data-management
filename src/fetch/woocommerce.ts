import { env } from "@/env";
import { WooCommerceASIProductUpdateData } from "@/types/schema/woocommerce";

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

// export async function cancelOrder(
//   orderId: number,
//   storeUrl: string,
//   storeKey: string,
//   storeSecret: string
// ) {
//   const headers = new Headers();
//   headers.append("Content-Type", "application/json");
//   headers.append(
//     "Authorization",
//     `Basic ${btoa(`${storeKey}:${storeSecret}`)}`
//   );

//   const requestOptions = {
//     method: "PUT",
//     headers: headers,
//     body: JSON.stringify({ status: "cancelled" }),
//   };

//   return fetch(`${storeUrl}/wp-json/wc/v3/orders/${orderId}`, requestOptions);
// }

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
