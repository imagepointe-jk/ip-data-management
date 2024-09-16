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

const cartStateProductLocationSchema = z.object({
  id: z.number(),
  artworks: z.array(cartStateArtworkSchema),
});

const cartStateProductViewSchema = z.object({
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

export type PlacedObject = z.infer<typeof objectDataSchema>;

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

export type EditorDialog = "colors" | "designs" | "upload" | null;
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
