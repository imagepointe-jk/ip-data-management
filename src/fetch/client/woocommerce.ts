export async function getOrderApprovalOrder(accessCode: string) {
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order-approval/orders?code=${accessCode}`
  );
}

export async function getOrderApprovalServerData(accessCode: string) {
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order-approval?code=${accessCode}`
  );
}
