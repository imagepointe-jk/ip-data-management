import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import {
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { DesignResults } from "./schema/designs";

export type PlacedObject = {
  editorGuid: string; //the GUID for use within the editor. Needed to distinguish objects, e.g. when two of the same artwork are present.
  positionNormalized: {
    x: number; //range 0-1
    y: number; //range 0-1
  };
  sizeNormalized: {
    x: number; //range 0-1
    y: number; //range 0-1
  };
  rotationDegrees: number;
};

//absolute pixel values
export type TransformArgsPx = {
  xPx?: number;
  yPx?: number;
  widthPx?: number;
  heightPx?: number;
  rotationDegrees?: number;
};

export type DesignStateArtwork = {
  imageUrl: string;
  identifiers: {
    designId: number;
    variationId?: number;
  }; //will also be used to point to URI of any user-uploaded artwork
  objectData: PlacedObject;
};

export type DesignStateLocation = {
  id: number;
  artworks: DesignStateArtwork[];
};

export type DesignStateView = {
  id: number;
  locations: DesignStateLocation[];
};

export type DesignStateVariation = {
  id: number;
  views: DesignStateView[];
};

export type DesignState = {
  products: {
    id: number;
    variations: DesignStateVariation[];
  }[];
};

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
};
