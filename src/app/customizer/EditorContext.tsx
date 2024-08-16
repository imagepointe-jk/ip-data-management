"use client";

import {
  convertTransformArgs,
  createInitialState,
  findArtworkInState,
  findLocationInState,
  findLocationWithArtworkInState,
} from "@/customizer/editor";
import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import { PlacedObject, TransformArgs } from "@/types/customizer";
import { DesignResults } from "@/types/types";
import {
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";
import { useImmer } from "use-immer";
import { editorSize } from "./components/ProductView";
import { v4 as uuidv4 } from "uuid";

type EditorDialog = "colors" | "designs" | "upload" | null;
export type DesignState = {
  products: {
    id: number;
    variations: {
      id: number;
      views: {
        id: number;
        locations: {
          id: number;
          artworks: {
            imageUrl: string;
            identifiers: { designId: number; variationId?: number }; //will also be used to point to URI of any user-uploaded artwork
            objectData: PlacedObject;
          }[];
        }[];
      }[];
    }[];
  }[];
};
type ViewWithIncludes = CustomProductView & {
  locations: CustomProductDecorationLocationNumeric[];
};
type VariationWithIncludes = CustomProductSettingsVariation & {
  views: ViewWithIncludes[];
};
type EditorContext = {
  designResults: DesignResults;
  designState: DesignState;
  selectedEditorGuid: string | null;
  setSelectedEditorGuid: (guid: string | null) => void;
  selectedVariation: VariationWithIncludes | undefined;
  selectedView: ViewWithIncludes | undefined;
  selectedLocation: CustomProductDecorationLocationNumeric | undefined;
  dialogOpen: EditorDialog;
  setDialogOpen: (dialog: EditorDialog) => void;
  selectedProductData: FullProductSettings | undefined;
  deleteArtworkFromState: (guid: string) => void;
  setArtworkTransform: (guid: string, transform: TransformArgs) => void;
  addDesign: (designId: number, variationId?: number) => PlacedObject;
};

const EditorContext = createContext(null as EditorContext | null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("No context");

  return context;
}

export type EditorProps = {
  initialProductId: number;
  designs: DesignResults;
  productData: FullProductSettings[];
};
export function EditorProvider({
  designs: designResults,
  initialProductId,
  productData,
  children,
}: EditorProps & { children: ReactNode }) {
  const initialProductData = productData.find(
    (data) => data.wooCommerceId === initialProductId
  );
  const { initialDesignState, initialVariation, initialView, initialLocation } =
    createInitialState(productData);

  const [designState, setDesignState] = useImmer(initialDesignState);
  const [selectedEditorGuid, setSelectedEditorGuid] = useState(
    null as string | null
  );
  const [selectedVariation, setSelectedVariation] = useState(initialVariation);
  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [dialogOpen, setDialogOpen] = useState(null as EditorDialog);

  function deleteArtworkFromState(guid: string) {
    setDesignState((draft) => {
      const locationWithArtwork = findLocationWithArtworkInState(draft, guid);
      if (!locationWithArtwork) return;
      locationWithArtwork.artworks = locationWithArtwork.artworks.filter(
        (artwork) => artwork.objectData.editorGuid !== guid
      );
    });
    setSelectedEditorGuid(null);
  }

  //expects absolute px amounts for position and size.
  //will convert to 0-1 range for storing in state.
  function setArtworkTransform(guid: string, transform: TransformArgs) {
    const { x, y, width, height } = convertTransformArgs(
      editorSize,
      editorSize,
      transform
    );
    setDesignState((draft) => {
      const artwork = findArtworkInState(draft, guid);
      if (!artwork) return;

      if (x) artwork.objectData.position.x = x;
      if (y) artwork.objectData.position.y = y;
      if (width) artwork.objectData.size.x = width;
      if (height) artwork.objectData.size.y = height;
      if (transform.rotationDegrees)
        artwork.objectData.rotationDegrees = transform.rotationDegrees;
    });
  }

  function addDesign(designId: number, variationId?: number) {
    const design = designResults.designs.find(
      (design) => design.id === designId
    );
    const variation = design?.variations.find(
      (variation) => variation.id === variationId
    );
    if (!design) throw new Error(`Design ${designId} not found.`);
    if (!variation && variationId !== undefined)
      throw new Error(
        `Variation ${variationId} of design ${designId} not found.`
      );

    const newObject: PlacedObject = {
      position: {
        x: 0.5,
        y: 0.5,
      },
      size: {
        x: 0.2,
        y: 0.2,
      },
      rotationDegrees: 0,
      editorGuid: uuidv4(),
    };

    setDesignState((draft) => {
      const location = findLocationInState(draft, selectedLocation.id);
      if (!location) return;

      location.artworks.push({
        imageUrl: variation?.imageUrl || design.imageUrl,
        identifiers: {
          designId: design.id,
          variationId: variation?.id,
        },
        objectData: newObject,
      });
    });

    return newObject;
  }

  return (
    <EditorContext.Provider
      value={{
        selectedEditorGuid,
        setSelectedEditorGuid,
        designState,
        selectedVariation,
        selectedView,
        selectedLocation,
        dialogOpen,
        selectedProductData: initialProductData,
        designResults,
        setDialogOpen,
        deleteArtworkFromState,
        setArtworkTransform,
        addDesign,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
