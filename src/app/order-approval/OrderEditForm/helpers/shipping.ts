import {
  getUpsRate,
  getUspsDomesticPrice,
  getUspsInternationalPrice,
} from "@/fetch/client/shipping";
import { WooCommerceOrder } from "@/types/schema/woocommerce";
import {
  validateUpsRateResponse,
  validateUspsPriceResponse,
} from "@/types/validations/shipping";
import { WebstoreShippingMethod } from "@prisma/client";

export function cleanShippingMethodName(name: string) {
  //matches escaped version of ® symbol, escaped version of ™ symbol, and anything else that isn't a number or letter
  const regex = /&#8482;|&#174;|[^a-zA-Z\s\d]/g;
  return name.replace(regex, "");
}

//we have to do string matching because we're relying on the string we get back from woocommerce to determine what shipping was chosen for the order.
//be as permissive as possible by ignoring symbols and using lowercase, while minimizing chance of false matches.
export function findMatchingShippingMethod(
  methodName: string,
  allShippingMethods: { id: number; name: string }[]
) {
  const cleanedTarget = cleanShippingMethodName(methodName).toLocaleLowerCase();

  return allShippingMethods.find((existingMethod) => {
    const cleanedExisting = cleanShippingMethodName(
      existingMethod.name
    ).toLocaleLowerCase();
    return cleanedExisting === cleanedTarget;
  });
}

export type RatedShippingMethod = {
  id: number;
  name: string;
  total: string | null;
  statusCode: number | null;
};
type ShippingRateParams = {
  method: WebstoreShippingMethod;
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
async function rateShippingMethod(
  params: ShippingRateParams
): Promise<RatedShippingMethod> {
  if (params.method.name.toLocaleLowerCase().includes("ups"))
    return getParsedUpsRate(params);
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

  const ratingResponse = await getUpsRate({
    service: {
      code: method.serviceCodeStr,
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
    try {
      const ratingJson = await ratingResponse.json();
      console.error(`UPS API Error: ${ratingJson.message}`);
    } catch (error) {
      console.error(`UPS API response ${ratingResponse.status}`);
    }
    const nullResult: RatedShippingMethod = {
      id: method.id,
      name: params.method.name,
      total: null,
      statusCode: ratingResponse.status,
    };
    nullResult.statusCode = ratingResponse.status;
    return nullResult;
  }

  const ratingJson = await ratingResponse.json();
  const parsed = validateUpsRateResponse(ratingJson);
  return {
    id: method.id,
    name: method.name,
    total: parsed.RateResponse.RatedShipment.TotalCharges.MonetaryValue,
    statusCode: ratingResponse.status,
  };
}

async function getParsedUspsRate(params: ShippingRateParams) {
  const isDomestic = params.countryCode === "US";

  const priceResponse = isDomestic
    ? await getUspsDomesticPrice({
        destinationZIPCode: params.postalCode,
        mailClass: params.method.serviceCodeStr,
        weight: params.totalWeight,
      })
    : await getUspsInternationalPrice({
        mailClass: params.method.serviceCodeStr,
        weight: params.totalWeight,
        foreignPostalCode: params.postalCode,
        destinationCountryCode: params.countryCode,
      });
  if (!priceResponse.ok) {
    console.error(`USPS API response ${priceResponse.status}`);
    const nullResult: RatedShippingMethod = {
      id: params.method.id,
      name: params.method.name,
      total: null,
      statusCode: priceResponse.status,
    };
    return nullResult;
  }

  const priceJson = await priceResponse.json();
  const parsed = validateUspsPriceResponse(priceJson);

  return {
    id: params.method.id,
    name: params.method.name,
    total: parsed.totalBasePrice.toFixed(2),
    statusCode: priceResponse.status,
  };
}

export async function getRatedShippingMethods(
  order: WooCommerceOrder,
  allShippingMethods: WebstoreShippingMethod[],
  special?: {
    //highly specific settings for edge cases
    allowUpsShippingToCanada?: boolean;
  }
) {
  const totalWeight = order.lineItems.reduce((accum, item) => {
    const weight = isNaN(+`${item.productWeight}`)
      ? 0
      : +`${item.productWeight}`;
    return accum + weight * item.quantity;
  }, 0);

  const permittedShippingMethods = allShippingMethods.filter((method) => {
    if (special?.allowUpsShippingToCanada) return method;
    return (
      order?.shipping.country !== "CA" ||
      !method.name.toLocaleLowerCase().includes("ups")
    );
  });

  const {
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    postcode,
    country,
  } = order.shipping;

  const ratedMethods: RatedShippingMethod[] = await Promise.all(
    permittedShippingMethods.map(async (method) =>
      rateShippingMethod({
        firstName,
        lastName,
        addressLine1: address1,
        addressLine2: address2,
        city,
        stateCode: state,
        postalCode: postcode,
        countryCode: country,
        method,
        totalWeight,
      })
    )
  );

  return ratedMethods;
}

export function reviseOrderAfterShippingRates(
  order: WooCommerceOrder,
  newRatedShippingMethods: RatedShippingMethod[]
): WooCommerceOrder {
  if (newRatedShippingMethods.length === 0) return order; //not much we can do if there are no valid methods for the order

  const existingShippingLine = order.shippingLines[0];
  if (!existingShippingLine) throw new Error("No shipping line to update");

  const selectedMethodName = existingShippingLine.method_title || "";
  const selectedMethodIsValid = isShippingMethodValid(
    selectedMethodName,
    newRatedShippingMethods
  );
  if (selectedMethodIsValid) return order;

  const cheapest = findCheapestShippingMethod(newRatedShippingMethods);

  return {
    ...order,
    shippingLines: [
      {
        id: existingShippingLine.id,
        method_title: cheapest.name,
      },
    ],
  };
}

function isShippingMethodValid(
  methodName: string,
  ratedShippingMethods: RatedShippingMethod[]
) {
  const initialMatch = findMatchingShippingMethod(
    methodName,
    ratedShippingMethods
  );
  const fullMatch = ratedShippingMethods.find(
    (method) => method.id === initialMatch?.id
  );
  return fullMatch ? fullMatch.total !== null : false;
}

function findCheapestShippingMethod(
  ratedShippingMethods: RatedShippingMethod[]
) {
  const sorted = [...ratedShippingMethods].sort((a, b) => {
    const aTotal = a.total ? +a.total : Number.MAX_SAFE_INTEGER;
    const bTotal = b.total ? +b.total : Number.MAX_SAFE_INTEGER; // make sure that any methods with NULL totals get pushed to the end
    return aTotal - bTotal;
  });

  const cheapest = sorted[0];
  if (!cheapest) throw new Error("No shipping methods provided to sort");
  return cheapest;
}
