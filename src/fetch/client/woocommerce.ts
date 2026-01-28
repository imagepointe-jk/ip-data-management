const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function getOrderApprovalOrder(accessCode: string) {
  return fetch(`${baseUrl}/api/order-approval/orders?code=${accessCode}`);
}

export async function getOrderApprovalServerData(accessCode: string) {
  return fetch(`${baseUrl}/api/order-approval?code=${accessCode}`);
}

export async function getOrderApprovalProduct(
  productId: number,
  accessCode: string,
) {
  return fetch(
    `${baseUrl}/api/order-approval/products/${productId}?code=${accessCode}`,
  );
}

//TODO: this function should be used to refactor updateDAProductVariationStock
export async function updateProductVariation(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  productId: number;
  variationId: number;
  stockQuantity?: number;
  price?: number;
}) {
  const {
    productId,
    variationId,
    price,
    stockQuantity,
    apiKey,
    apiSecret,
    storeUrl,
  } = params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity) bodyData.stock_quantity = stockQuantity;
  if (price) bodyData.regular_price = `${price}`;

  return fetch(
    `${storeUrl}/wp-json/wc/v3/products/${productId}/variations/${variationId}`,
    {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
      },
    },
  );
}

export async function updateProduct(params: {
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  productId: number;
  stockQuantity?: number;
  price?: number;
}) {
  const { productId, price, stockQuantity, apiKey, apiSecret, storeUrl } =
    params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity) bodyData.stock_quantity = stockQuantity;
  if (price) bodyData.regular_price = `${price}`;

  return fetch(`${storeUrl}/wp-json/wc/v3/products/${productId}`, {
    method: "POST",
    body: JSON.stringify(bodyData),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
    },
  });
}
