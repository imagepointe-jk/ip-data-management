import { UpsRateRequest } from "@/types/schema/shipping";

type UpsSat = {
  issued_at: string;
  expires_in: string; //in seconds
  access_token: string;
};
let upsSat: UpsSat; //UPS short-lived access token. should only be accessed from getUpsAccessToken.
const upsUrl = "https://wwwcie.ups.com";

const upsCredentials = () => {
  const key = process.env.UPS_API_KEY;
  const secret = process.env.UPS_API_SECRET;
  if (!key || !secret) throw new Error("Missing UPS credentials");
  return { key, secret };
};

const upsBillingAccountNumber = () => {
  const number = process.env.UPS_BILLING_ACCOUNT_NUMBER;
  if (!number) throw new Error("Missing UPS billing account number");
  return number;
};

async function getUpsAccessToken() {
  if (upsSat !== undefined) {
    const expiresAt = +upsSat.issued_at + +upsSat.expires_in * 1000;
    const time = Date.now();
    if (time < expiresAt) return upsSat;
  }

  const { key, secret } = upsCredentials();
  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
  });
  const urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");

  const requestOptions = {
    method: "POST",
    headers,
    body: urlencoded,
  };

  const response = await fetch(
    `${upsUrl}/security/v1/oauth/token`,
    requestOptions
  );
  const json = await response.json();
  if (!response.ok)
    console.error(
      `FAILED to get UPS API access token with status ${response.status}`
    );

  upsSat = json;
  return upsSat;
}

export async function getUpsRate(request: UpsRateRequest) {
  const { access_token } = await getUpsAccessToken();
  const billingNumber = upsBillingAccountNumber();
  //the billing number is omitted in the front end fetch request for security;
  //fill it in using environment variables here
  request.RateRequest.Shipment.Shipper.ShipperNumber = billingNumber;
  request.RateRequest.Shipment.PaymentDetails.ShipmentCharge.BillShipper.AccountNumber =
    billingNumber;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${access_token}`,
  });
  const raw = JSON.stringify(request);
  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
  };

  return fetch(`${upsUrl}/api/rating/v2403/Rate`, requestOptions);
}
