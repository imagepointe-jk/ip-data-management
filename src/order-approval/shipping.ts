import { RatedShippingMethod } from "@/app/order-approval/OrderEditForm/OrderEditForm";
import {
  getUpsRate,
  getUspsDomesticPrice,
  getUspsInternationalPrice,
} from "@/fetch/client/shipping";
import {
  WooCommerceOrder,
  WooCommerceProduct,
} from "@/types/schema/woocommerce";
import {
  validateUpsRateResponse,
  validateUspsPriceResponse,
} from "@/types/validations/shipping";

//we have to do exact string matching because we're relying on the string we get back from woocommerce to determine what shipping was chosen for the order.
const upsShippingCodes: { exactString: string; code: string }[] = [
  //domestic
  {
    exactString: "UPS 3 Day Select&#174;",
    code: "12",
  },
  {
    exactString: "UPS&#174; Ground",
    code: "03",
  },
  {
    exactString: "UPS 2nd Day Air&#174;",
    code: "02",
  },
  {
    exactString: "UPS Next Day Air&#174;",
    code: "01",
  },
  //intl
  {
    exactString: "UPS Worldwide Express&#8482;",
    code: "07",
  },
  {
    exactString: "UPS Worldwide Express Plus&#8482;",
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
  {
    exactString: "UPS&#174; Standard",
    code: "11",
  },
];
const uspsShippingCodes: { exactString: string; code: string }[] = [
  {
    exactString: "Priority Mail&#174; (USPS)",
    code: "PRIORITY_MAIL",
  },
  {
    exactString: "Ground Advantage&#8482; (USPS)",
    code: "USPS_GROUND_ADVANTAGE",
  },
  {
    exactString: "Priority Mail International&#174; (USPS)",
    code: "PRIORITY_MAIL_INTERNATIONAL",
  },
  {
    exactString: "Priority Mail Express International&#8482; (USPS)",
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
async function rateShippingMethod(
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
    statusCode: null,
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
    try {
      const ratingJson = await ratingResponse.json();
      console.error(`UPS API Error: ${ratingJson.message}`);
    } catch (error) {
      console.error(`UPS API response ${ratingResponse.status}`);
    }
    nullResult.statusCode = ratingResponse.status;
    return nullResult;
  }

  const ratingJson = await ratingResponse.json();
  const parsed = validateUpsRateResponse(ratingJson);
  return {
    name: method,
    total: parsed.RateResponse.RatedShipment.TotalCharges.MonetaryValue,
    statusCode: ratingResponse.status,
  };
}

async function getParsedUspsRate(params: ShippingRateParams) {
  const nullResult: RatedShippingMethod = {
    name: params.method,
    total: null,
    statusCode: null,
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
    nullResult.statusCode = priceResponse.status;
    return nullResult;
  }

  const priceJson = await priceResponse.json();
  const parsed = validateUspsPriceResponse(priceJson);

  return {
    name: params.method,
    total: parsed.totalBasePrice.toFixed(2),
    statusCode: priceResponse.status,
  };
}

export async function getRatedShippingMethods(
  order: WooCommerceOrder,
  products: WooCommerceProduct[],
  shippingMethods: string[],
  special?: {
    //highly specific settings for edge cases
    allowUpsShippingToCanada?: boolean;
  }
) {
  if (!products) throw new Error("No products");

  const totalWeight = products.reduce((accum, product) => {
    const matchingLineItem = order.lineItems.find(
      (item) => item.productId === product.id
    );
    const thisWeight = matchingLineItem
      ? matchingLineItem.quantity * +product.weight
      : 0;
    return accum + thisWeight;
  }, 0);

  const permittedShippingMethods = shippingMethods.filter((method) => {
    if (special?.allowUpsShippingToCanada) return method;
    return order?.shipping.country !== "CA" || !method.includes("UPS");
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

export function compareShippingMethodTitles(title1: string, title2: string) {
  const cleaned1 = title1.replace("™", "&#8482;").replace("®", "&#174;");
  const cleaned2 = title2.replace("™", "&#8482;").replace("®", "&#174;");
  return cleaned1 === cleaned2;
}
