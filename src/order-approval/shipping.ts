import { RatedShippingMethod } from "@/components/WooOrderView/WooOrderView";
import {
  getUpsRate,
  getUspsDomesticPrice,
  getUspsInternationalPrice,
} from "@/fetch/client/shipping";
import {
  validateUpsRateResponse,
  validateUspsPriceResponse,
} from "@/types/validations/shipping";

//we have to do exact string matching because we're relying on the string we get back from woocommerce to determine what shipping was chosen for the order.
const upsShippingCodes: { exactString: string; code: string }[] = [
  //domestic
  {
    exactString: "UPS 3-Day Select®",
    code: "12",
  },
  {
    exactString: "UPS® Ground",
    code: "03",
  },
  {
    exactString: "UPS 2nd Day Air®",
    code: "02",
  },
  {
    exactString: "UPS Next Day Air®",
    code: "01",
  },
  //intl
  {
    exactString: "UPS Worldwide Express™",
    code: "07",
  },
  {
    exactString: "UPS Worldwide Express Plus™",
    code: "54",
  },
  {
    exactString: "UPS Worldwide Expedited",
    code: "08",
  },
  {
    exactString: "UPS Worldwide Saver",
    code: "65",
  },
];
const uspsShippingCodes: { exactString: string; code: string }[] = [
  {
    exactString: "Priority Mail® (USPS)",
    code: "PRIORITY_MAIL",
  },
  {
    exactString: "Ground Advantage™ (USPS)",
    code: "USPS_GROUND_ADVANTAGE",
  },
  {
    exactString: "Priority Mail International® (USPS)",
    code: "PRIORITY_MAIL_INTERNATIONAL",
  },
  {
    exactString: "Priority Mail Express International™ (USPS)",
    code: "PRIORITY_MAIL_EXPRESS_INTERNATIONAL",
  },
];

type ShippingRateParams = {
  method: string;
  totalWeight: number;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  countryCode: string;
  postalCode: string;
  stateCode: string;
};
export async function rateShippingMethod(
  params: ShippingRateParams
): Promise<RatedShippingMethod> {
  if (params.method.includes("UPS")) return getParsedUpsRate(params);
  else return getParsedUspsRate(params);
}

async function getParsedUpsRate(params: ShippingRateParams) {
  const {
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    countryCode,
    postalCode,
    stateCode,
    totalWeight,
    method,
  } = params;

  const nullResult: RatedShippingMethod = {
    name: method,
    total: null,
  };

  const matchingData = upsShippingCodes.find(
    (code) => code.exactString === method
  );
  if (!matchingData) return nullResult;

  const ratingResponse = await getUpsRate({
    service: {
      code: matchingData.code,
      description: "abc",
    },
    shipTo: {
      Name: `${firstName} ${lastName}`,
      Address: {
        AddressLine: [addressLine1, addressLine2],
        City: city,
        CountryCode: countryCode,
        PostalCode: postalCode,
        StateProvinceCode: stateCode,
      },
    },
    weight: totalWeight,
  });
  if (!ratingResponse.ok) {
    console.error(`UPS API response ${ratingResponse.status}`);
    return nullResult;
  }

  const ratingJson = await ratingResponse.json();
  const parsed = validateUpsRateResponse(ratingJson);
  return {
    name: method,
    total: parsed.RateResponse.RatedShipment.TotalCharges.MonetaryValue,
  };
}

async function getParsedUspsRate(params: ShippingRateParams) {
  const nullResult: RatedShippingMethod = {
    name: params.method,
    total: null,
  };

  const matchingData = uspsShippingCodes.find(
    (code) => code.exactString === params.method
  );
  if (!matchingData) {
    console.error(`No match found for ${params.method}`);
    return nullResult;
  }

  const isDomestic = params.countryCode === "US";

  const priceResponse = isDomestic
    ? await getUspsDomesticPrice({
        destinationZIPCode: params.postalCode,
        mailClass: matchingData.code,
        weight: params.totalWeight,
      })
    : await getUspsInternationalPrice({
        mailClass: matchingData.code,
        weight: params.totalWeight,
        foreignPostalCode: params.postalCode,
        destinationCountryCode: params.countryCode,
      });
  if (!priceResponse.ok) {
    console.error(`USPS API response ${priceResponse.status}`);
    return nullResult;
  }

  const priceJson = await priceResponse.json();
  const parsed = validateUspsPriceResponse(priceJson);

  return {
    name: params.method,
    total: parsed.totalBasePrice.toFixed(2),
  };
}
