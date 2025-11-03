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
      PaymentDetails: z
        .object({
          ShipmentCharge: z.object({
            Type: z.string(),
            BillShipper: z.object({
              AccountNumber: z.string(),
            }),
          }),
        })
        .optional(), //PaymentDetails only required for retrieving negotiated rates
      Service: z.object({
        Code: z.string(),
        Description: z.string(),
      }),
      NumOfPieces: z.string(),
      Package: z.array(
        z.object({
          PackagingType: z.object({
            Code: z.string(),
            Description: z.string(),
          }),
          PackageWeight: z.object({
            UnitOfMeasurement: unitOfMeasurementSchema,
            Weight: z.string(),
          }),
        })
      ),
    }),
  }),
});
export const upsBatchRateRequestSchema = z.array(upsRateRequestSchema);
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

export const uspsDomesticPriceRequestSchema = z.object({
  originZIPCode: z.string(),
  destinationZIPCode: z.string(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  mailClass: z.string(),
  processingCategory: z.string(),
  rateIndicator: z.string(),
  destinationEntryFacilityType: z.string(),
  priceType: z.string(),
});

export const uspsInternationalPriceRequestSchema = z.object({
  originZIPCode: z.string(),
  foreignPostalCode: z.string(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  mailClass: z.string(),
  processingCategory: z.string(),
  rateIndicator: z.string(),
  destinationEntryFacilityType: z.string(),
  destinationCountryCode: z.string(),
  priceType: z.string(),
});

export const uspsPriceResponseSchema = z.object({
  totalBasePrice: z.number(),
});

export type UpsRateRequest = z.infer<typeof upsRateRequestSchema>;
export type UpsRateResponse = z.infer<typeof upsRateResponseSchema>;
export type UspsDomesticPriceRequest = z.infer<
  typeof uspsDomesticPriceRequestSchema
>;
export type UspsInternationalPriceRequest = z.infer<
  typeof uspsInternationalPriceRequestSchema
>;
export type ShippingAddress = z.infer<typeof addressSchema>;
