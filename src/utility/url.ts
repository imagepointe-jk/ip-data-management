export const rootUrl = () => {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return process.env.BASE_URL;
};

export function createApproverFrontEndUrl(
  webstoreUrl: string,
  accessCode: string,
  action?: "approve" | "deny"
) {
  return `${webstoreUrl}/order-approval?code=${accessCode}${
    action ? `&action=${action}` : ""
  }`;
}

export function createWooCommerceProductAdminUrl(
  productId: number,
  url = "https://www.imagepointe.com"
) {
  return `${url}/wp-admin/post.php?post=${productId}&action=edit`;
}
