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

export async function getProduct(id: number) {
  const headers = standardHeaders();

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  return fetch(
    `https://www.imagepointe.com/wp-json/wc/v3/products/${id}`,
    requestOptions
  );
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

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  return fetch(`${storeUrl}/wp-json/wc/v3/orders/${id}`, requestOptions);
}

type OrderUpdateData = {
  id: number;
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
