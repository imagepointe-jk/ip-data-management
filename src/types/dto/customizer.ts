import { ColorDTO } from "./common";

export type SizeOptionsDTO = {
  id: number;
  sizeSmall: boolean;
  sizeMedium: boolean;
  sizeLarge: boolean;
  sizeXL: boolean;
  size2XL: boolean;
  size3XL: boolean;
  size4XL: boolean;
  size5XL: boolean;
  size6XL: boolean;
};

export type DecorationLocationDTO = {
  id: number;
  name: string;
  visible: boolean;
  frameColor: string;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
};

export type ViewDTO = {
  id: number;
  name: string;
  imageUrl: string;
  locations: DecorationLocationDTO[];
};

export type VariationDTO = {
  id: number;
  colorId: number;
  color: ColorDTO;
  order: number;
  sizeOptions: SizeOptionsDTO;
  views: ViewDTO[];
};

// export type CustomProductDecorationLocationNumeric = {
//   [K in keyof DecorationLocationDTO]: DecorationLocationDTO[K] extends Decimal
//     ? number
//     : DecorationLocationDTO[K];
// };

export type FullProductSettingsDTO = {
  id: number;
  wooCommerceId: number;
  order: number;
  variations: VariationDTO[];
  published: boolean;
};

export type PopulatedProductSettings = FullProductSettingsDTO & {
  product: { name: string; sku: string; weight: string } | undefined;
};

// export type FullProductSettings = CustomProductSettings & {
//   variations: (CustomProductSettingsVariation & { color: ColorDTO } & {
//     sizeOptions: ProductSizeOptions;
//   } & {
//     views: (CustomProductView & {
//       locations: CustomProductDecorationLocationNumeric[];
//     })[];
//   })[];
// };
