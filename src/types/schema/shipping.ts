import { z } from "zod";

const addressSchema = z.object({
  AddressLine: z.array(z.string()),
  City: z.string(),
  StateProvinceCode: z.string(),
  PostalCode: z.string(),
  CountryCode: z.string(),
});
const unitOfMeasurementSchema = z.object({
  Code: z.string(),
  Description: z.string(),
});
export const upsRateRequestSchema = z.object({
  RateRequest: z.object({
    Request: z.object({
      RequestOption: z.string(),
    }),
    Shipment: z.object({
      Shipper: z.object({
        Name: z.string(),
        ShipperNumber: z.string(),
        Address: addressSchema,
      }),
      ShipTo: z.object({
        Name: z.string(),
        Address: addressSchema,
      }),
      ShipFrom: z.object({
        Name: z.string(),
        Address: addressSchema,
      }),
      PaymentDetails: z.object({
        ShipmentCharge: z.object({
          Type: z.string(),
          BillShipper: z.object({
            AccountNumber: z.string(),
          }),
        }),
      }),
      Service: z.object({
        Code: z.string(),
        Description: z.string(),
      }),
      NumOfPieces: z.string(),
      Package: z.object({
        PackagingType: z.object({
          Code: z.string(),
          Description: z.string(),
        }),
        PackageWeight: z.object({
          UnitOfMeasurement: unitOfMeasurementSchema,
          Weight: z.string(),
        }),
      }),
    }),
  }),
});
export const upsRateResponseSchema = z.object({
  RateResponse: z.object({
    RatedShipment: z.object({
      TotalCharges: z.object({
        CurrencyCode: z.string(),
        MonetaryValue: z.string(),
      }),
    }),
  }),
});

export type UpsRateRequest = z.infer<typeof upsRateRequestSchema>;
export type UpsRateResponse = z.infer<typeof upsRateResponseSchema>;
export type ShippingAddress = z.infer<typeof addressSchema>;
