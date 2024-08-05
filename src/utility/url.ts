export const rootUrl = () => {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return process.env.BASE_URL;
};

export function createApproverFrontEndUrl(
  webstoreUrl: string,
  accessCode: string,
  action?: "approve" | "deny"
) {
  return `${webstoreUrl}?code=${accessCode}${
    action ? `&action=${action}` : ""
  }`;
}
