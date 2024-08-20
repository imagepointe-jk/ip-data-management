const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function getOrderApprovalOrder(accessCode: string) {
  return fetch(`${baseUrl}/api/order-approval/orders?code=${accessCode}`);
}

export async function getOrderApprovalServerData(accessCode: string) {
  return fetch(`${baseUrl}/api/order-approval?code=${accessCode}`);
}

export async function getOrderApprovalProduct(
  productId: number,
  accessCode: string
) {
  return fetch(
    `${baseUrl}/api/order-approval/products/${productId}?code=${accessCode}`
  );
}
