import {
  ShippingAddress,
  UpsRateRequest,
  UspsDomesticPriceRequest,
  UspsInternationalPriceRequest,
} from "@/types/schema/shipping";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
type UpsRateParams = {
  shipTo: {
    Name: string;
    Address: ShippingAddress;
  };
  weight: number;
  service: {
    code: string;
    description: string;
  };
  accountNumber: string | null;
};
export async function getUpsRate(params: UpsRateParams) {
  const request: UpsRateRequest = {
    RateRequest: {
      Request: {
        RequestOption: "Rate",
      },
      Shipment: {
        Shipper: {
          Name: "Image Pointe",
          ShipperNumber: "Not Yet Set",
          Address: {
            AddressLine: ["1224 La Porte Rd"],
            City: "Waterloo",
            StateProvinceCode: "IA",
            PostalCode: "50702",
            CountryCode: "US",
          },
        },
        ShipFrom: {
          Name: "Image Pointe",
          Address: {
            AddressLine: ["2975 Airline Circle"],
            City: "Waterloo",
            StateProvinceCode: "IA",
            PostalCode: "50703",
            CountryCode: "US",
          },
        },
        ShipTo: params.shipTo,
        NumOfPieces: "1", //inaccurate but it doesn't seem to matter
        Package: generateUpsPackages(params.weight),
        Service: {
          Code: params.service.code,
          Description: params.service.description,
        },
      },
    },
  };

  if (params.accountNumber) {
    request.RateRequest.Shipment.Shipper.ShipperNumber = params.accountNumber;
    request.RateRequest.Shipment.PaymentDetails = {
      ShipmentCharge: {
        Type: "01",
        BillShipper: {
          AccountNumber: params.accountNumber,
        },
      },
    };
  }

  const requestOptions = {
    method: "POST",
    body: JSON.stringify(request),
  };
  return fetch(`${baseUrl}/api/shipping/ups/rate`, requestOptions);
}

function generateUpsPackages(weight: number) {
  const weightPerPackage = 45;
  let remainingWeight = weight;
  const packages: {
    PackagingType: {
      Code: string;
      Description: string;
    };
    PackageWeight: {
      UnitOfMeasurement: {
        Code: string;
        Description: string;
      };
      Weight: string;
    };
  }[] = [];
  while (remainingWeight > 0) {
    const thisWeight =
      remainingWeight > weightPerPackage ? weightPerPackage : remainingWeight;
    packages.push({
      PackagingType: {
        Code: "02",
        Description: "Packaging",
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: "LBS",
          Description: "Pounds",
        },
        Weight: `${thisWeight}`,
      },
    });

    remainingWeight -= thisWeight;
  }

  return packages;
}

type UspsPriceParams = {
  weight: number;
  mailClass: string;
};
export async function getUspsDomesticPrice({
  destinationZIPCode,
  weight,
  mailClass,
}: UspsPriceParams & { destinationZIPCode: string }) {
  const request: UspsDomesticPriceRequest = {
    originZIPCode: "50703",
    destinationZIPCode,
    weight,
    mailClass,
    length: 12,
    width: 12,
    height: 12,
    processingCategory: "NON_MACHINABLE",
    rateIndicator: "SP",
    destinationEntryFacilityType: "NONE",
    priceType: "RETAIL",
  };
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(request),
  };
  return fetch(`${baseUrl}/api/shipping/usps/prices`, requestOptions);
}

export async function getUspsInternationalPrice({
  destinationCountryCode,
  foreignPostalCode,
  mailClass,
  weight,
}: UspsPriceParams & {
  foreignPostalCode: string;
  destinationCountryCode: string;
}) {
  const request: UspsInternationalPriceRequest = {
    originZIPCode: "50703",
    destinationCountryCode,
    weight,
    mailClass,
    length: 12,
    width: 12,
    height: 12,
    processingCategory: "NON_MACHINABLE",
    rateIndicator: "SP",
    destinationEntryFacilityType: "NONE",
    priceType: "RETAIL",
    foreignPostalCode,
  };
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(request),
  };
  return fetch(
    `${baseUrl}/api/shipping/usps/international-prices`,
    requestOptions
  );
}
