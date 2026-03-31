import { OrderImportDTO } from "@/types/schema/orders";

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

export async function getAllProducts(
  storeUrl: string,
  key: string,
  secret: string,
  includeVariations = true,
) {
  return fetch(
    `${storeUrl}/wp-json/wc/v3/products?per_page=100${includeVariations ? "&include_variations=true" : ""}`, //100 is max per page; we may need to do multiple requests for large stores
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
      },
    },
  );
}

export async function createOrder(
  storeUrl: string,
  key: string,
  secret: string,
  data: OrderImportDTO,
) {
  const body: any = {};
  const { billing, shipping, lineItems, customerNote, couponCode } = data;

  body.billing = {
    first_name: billing.firstName,
    last_name: billing.lastName,
    address_1: billing.addressLine1,
    city: billing.city,
    state: billing.state,
    postcode: billing.zip,
    country: billing.country,
    email: billing.email,
  };

  if (billing.addressLine2) body.address_2 = data.billing.addressLine2;
  if (billing.phone) body.phone = data.billing.phone;

  body.shipping = {
    first_name: shipping.firstName,
    last_name: shipping.lastName,
    address_1: shipping.addressLine1,
    city: shipping.city,
    state: shipping.state,
    postcode: shipping.zip,
    country: shipping.country,
  };

  body.line_items = lineItems.map((item) => {
    const obj: any = {};
    obj.product_id = item.productId;
    if (item.variationId) obj.variation_id = item.variationId;
    obj.quantity = item.quantity;

    return obj;
  });

  if (couponCode) {
    body.coupon_lines = [
      {
        code: couponCode,
      },
    ];
  }

  body.shipping_lines = [
    {
      method_title: "UPS Ground", //hardcoded for now
      method_id: "ups_ground", //hardcoded for now
    },
  ];

  if (customerNote) body.customer_note = customerNote;
  body.status = "processing"; //hardcoded for now

  return fetch(`${storeUrl}/wp-json/wc/v3/orders`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
    },
  });
}
