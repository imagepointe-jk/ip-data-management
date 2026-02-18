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
  published?: boolean;
}) {
  const {
    productId,
    variationId,
    price,
    stockQuantity,
    published,
    apiKey,
    apiSecret,
    storeUrl,
  } = params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity !== undefined) bodyData.stock_quantity = stockQuantity;
  if (price !== undefined) bodyData.regular_price = `${price}`;
  if (published !== undefined)
    bodyData.status = published ? "publish" : "private";

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
  published?: boolean;
}) {
  const {
    productId,
    price,
    stockQuantity,
    published,
    apiKey,
    apiSecret,
    storeUrl,
  } = params;

  const bodyData: { [key: string]: number | string } = {};
  if (stockQuantity !== undefined) bodyData.stock_quantity = stockQuantity;
  if (price !== undefined) bodyData.regular_price = `${price}`;
  if (published !== undefined)
    bodyData.status = published ? "publish" : "draft";

  return fetch(`${storeUrl}/wp-json/wc/v3/products/${productId}`, {
    method: "POST",
    body: JSON.stringify(bodyData),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
    },
  });
}
