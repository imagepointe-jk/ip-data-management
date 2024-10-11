import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { DesignResults } from "./designs";
import { z } from "zod";

const objectDataSchema = z.object({
  editorGuid: z.string(), //the GUID for use within the editor. Needed to distinguish objects, e.g. when two of the same artwork are present.
  positionNormalized: z.object({
    x: z.number(), //range 0-1
    y: z.number(), //range 0-1
  }),
  sizeNormalized: z.object({
    x: z.number(), //range 0-1
    y: z.number(), //range 0-1
  }),
  rotationDegrees: z.number(),
});

const textStyleSchema = z.object({
  fontSize: z.number().optional(),
  hexCode: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  fontStyle: z
    .union([z.enum(["italic", "bold", "italic bold"]), z.null()])
    .optional(),
  textDecoration: z
    .union([z.enum(["underline", "line-through"]), z.null()])
    .optional(),
  strokeHexCode: z.union([z.string(), z.null()]).optional(),
  strokeWidth: z.number().optional(),
});

const textDataSchema = z.object({
  text: z.string(),
  style: textStyleSchema.optional(),
});

const cartStateArtworkSchema = z.object({
  imageUrl: z.string(),
  identifiers: z.object({
    designIdentifiers: z
      .object({
        designId: z.number(),
        variationId: z.number().optional(),
      })
      .optional(),
  }),
  objectData: objectDataSchema,
});

const cartStateTextSchema = z.object({
  objectData: objectDataSchema,
  textData: textDataSchema,
});

const cartStateProductLocationSchema = z.object({
  id: z.number(),
  artworks: z.array(cartStateArtworkSchema),
  texts: z.array(cartStateTextSchema),
});

export const cartStateProductViewSchema = z.object({
  id: z.number(),
  locations: z.array(cartStateProductLocationSchema),
});

export const cartStateProductVariationSchema = z.object({
  id: z.number(),
  views: z.array(cartStateProductViewSchema),
});

const cartStateProductSchema = z.object({
  id: z.number(),
  variations: z.array(cartStateProductVariationSchema),
});

export const cartStateSchema = z.object({
  products: z.array(cartStateProductSchema),
});

export const quoteRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  company: z.string(),
  local: z.string().optional(),
  comments: z.string().optional(),
  cart: cartStateSchema,
});

export type PlacedObject = z.infer<typeof objectDataSchema>;
export type EditorTextData = z.infer<typeof textDataSchema>;
export type EditorTextStyle = z.infer<typeof textStyleSchema>;

//absolute pixel values
export type TransformArgsPx = {
  xPx?: number;
  yPx?: number;
  widthPx?: number;
  heightPx?: number;
  rotationDegrees?: number;
};

export type CartStateArtwork = z.infer<typeof cartStateArtworkSchema>;
export type CartStateProductLocation = z.infer<
  typeof cartStateProductLocationSchema
>;
export type CartStateProductView = z.infer<typeof cartStateProductViewSchema>;
export type CartStateProductVariation = z.infer<
  typeof cartStateProductVariationSchema
>;
export type CartStateProduct = z.infer<typeof cartStateProductSchema>;
export type CartState = z.infer<typeof cartStateSchema>;

export type EditorDialog =
  | "colors"
  | "designs"
  | "upload"
  | "text"
  | "help"
  | null;
export type EditorModal = "cart" | null;

export type ViewWithIncludes = CustomProductView & {
  locations: CustomProductDecorationLocationNumeric[];
};
export type VariationWithIncludes = CustomProductSettingsVariation & {
  views: ViewWithIncludes[];
};
export type PopulatedProductSettings = FullProductSettings & {
  product: { name: string; weight: string } | undefined;
};
export type PopulatedProductSettingsSerializable = Omit<
  FullProductSettings,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  product: { name: string; weight: string } | undefined;
};
export type QuoteRequestData = z.infer<typeof quoteRequestSchema>;
export type EditorContext = {
  designResults: DesignResults;
  designState: CartState;
  selectedEditorGuid: string | null;
  setSelectedEditorGuid: (guid: string | null) => void;
  selectedVariation: CartStateProductVariation;
  selectedView: CartStateProductView;
  selectedLocation: CartStateProductLocation;
  setSelectedLocationId: (id: number) => void;
  dialogOpen: EditorDialog;
  setDialogOpen: (dialog: EditorDialog) => void;
  selectedProductData: PopulatedProductSettings;
  deleteArtworkFromState: (guid: string) => void;
  setArtworkTransform: (guid: string, transform: TransformArgsPx) => void;
  addDesign: (designId: number, variationId?: number) => PlacedObject;
  addVariation: (variationId: number) => void;
  removeVariation: (variationId: number) => void;
};
