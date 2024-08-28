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

const designStateArtwork = z.object({
  imageUrl: z.string(),
  identifiers: z.object({
    designId: z.number(),
    variationId: z.number().optional(),
  }), //will also be used to point to URI of any user-uploaded artwork
  objectData: objectDataSchema,
});

const designStateLocation = z.object({
  id: z.number(),
  artworks: z.array(designStateArtwork),
});

const designStateView = z.object({
  id: z.number(),
  locations: z.array(designStateLocation),
});

const designStateVariation = z.object({
  id: z.number(),
  views: z.array(designStateView),
});

const designStateProduct = z.object({
  id: z.number(),
  variations: z.array(designStateVariation),
});

export const designStateSchema = z.object({
  products: z.array(designStateProduct),
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

export type DesignStateArtwork = z.infer<typeof designStateArtwork>;
export type DesignStateLocation = z.infer<typeof designStateLocation>;
export type DesignStateView = z.infer<typeof designStateView>;
export type DesignStateVariation = z.infer<typeof designStateVariation>;
export type DesignState = z.infer<typeof designStateSchema>;

export type EditorDialog = "colors" | "designs" | "upload" | null;

export type ViewWithIncludes = CustomProductView & {
  locations: CustomProductDecorationLocationNumeric[];
};
export type VariationWithIncludes = CustomProductSettingsVariation & {
  views: ViewWithIncludes[];
};
export type EditorContext = {
  designResults: DesignResults;
  designState: DesignState;
  selectedEditorGuid: string | null;
  setSelectedEditorGuid: (guid: string | null) => void;
  selectedVariation: DesignStateVariation;
  selectedView: DesignStateView;
  selectedLocation: DesignStateLocation;
  setSelectedLocationId: (id: number) => void;
  dialogOpen: EditorDialog;
  setDialogOpen: (dialog: EditorDialog) => void;
  selectedProductData: FullProductSettings;
  deleteArtworkFromState: (guid: string) => void;
  setArtworkTransform: (guid: string, transform: TransformArgsPx) => void;
  addDesign: (designId: number, variationId?: number) => PlacedObject;
  addVariation: (variationId: number) => void;
  removeVariation: (variationId: number) => void;
};
