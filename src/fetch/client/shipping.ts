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
        NumOfPieces: "1",
        Package: {
          PackagingType: {
            Code: "02",
            Description: "Packaging",
          },
          PackageWeight: {
            UnitOfMeasurement: {
              Code: "LBS",
              Description: "Pounds",
            },
            Weight: `${params.weight}`,
          },
        },
        PaymentDetails: {
          ShipmentCharge: {
            Type: "01",
            BillShipper: {
              AccountNumber: "Not Yet Set",
            },
          },
        },
        Service: {
          Code: params.service.code,
          Description: params.service.description,
        },
      },
    },
  };
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(request),
  };
  return fetch(`${baseUrl}/api/shipping/ups/rate`, requestOptions);
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
