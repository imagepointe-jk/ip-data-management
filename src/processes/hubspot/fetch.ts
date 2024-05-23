import { HubSpotOwner } from "@/types/schema";
import { SyncError } from "./error";
import { parseHubSpotOwnerResults } from "@/types/validations";

const accessToken = () => {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken)
    throw new SyncError(
      "Environment",
      undefined,
      undefined,
      "No HubSpot access token!"
    );
  return accessToken;
};

const standardHeaders = () => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${accessToken()}`);
  return headers;
};

export async function getAllOwners(): Promise<HubSpotOwner[]> {
  const headers = standardHeaders();
  headers.delete("Content-Type");

  const requestOptions = {
    method: "GET",
    headers: headers,
  };

  //HubSpot currently imposes a hard limit of 500 owners per request.
  //assume the company has less than 500 owners in HubSpot.
  const response = await fetch(
    "https://api.hubapi.com/crm/v3/owners/?limit=500",
    requestOptions
  );
  if (!response.ok) return [];

  const json = await response.json();
  const parsed = parseHubSpotOwnerResults(json);
  return parsed.results;
}
