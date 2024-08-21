import { ShippingAddress, UpsRateRequest } from "@/types/schema/shipping";

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
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/shipping/ups/rate`,
    requestOptions
  );
}
