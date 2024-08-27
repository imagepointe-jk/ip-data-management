"use client";

import {
  convertTransformArgs,
  createInitialState,
  findArtworkInState,
  findLocationInState,
  findLocationWithArtworkInState,
  findVariationInState,
  findViewInState,
} from "@/customizer/utils";
import { FullProductSettings } from "@/db/access/customizer";
import {
  EditorContext as EditorContextType,
  EditorDialog,
  PlacedObject,
  TransformArgs,
} from "@/types/customizer";
import { DesignResults } from "@/types/schema/designs";
import { createContext, ReactNode, useContext, useState } from "react";
import { useImmer } from "use-immer";
import { v4 as uuidv4 } from "uuid";
import { editorSize } from "./components/ProductView";

const EditorContext = createContext(null as EditorContextType | null);

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
  const [selectedProductData, setSelectedProductData] =
    useState(initialProductData);
  const [selectedVariationId, setSelectedVariationId] = useState(
    initialVariation.id
  );
  const [selectedViewId, setSelectedViewId] = useState(initialView.id);
  const [selectedLocationId, setSelectedLocationId] = useState(
    initialLocation.id
  );
  const [dialogOpen, setDialogOpen] = useState(null as EditorDialog);

  if (!selectedProductData) throw new Error(`No product selected`);
  const selectedVariation = findVariationInState(
    designState,
    selectedVariationId
  );
  if (!selectedVariation)
    throw new Error(`Selected variation ${selectedVariationId} not found`);
  const selectedView = findViewInState(designState, selectedViewId);
  if (!selectedView)
    throw new Error(`Selected view ${selectedViewId} not found`);
  const selectedLocation = findLocationInState(designState, selectedLocationId);
  if (!selectedLocation)
    throw new Error(`Selected location ${selectedLocationId} not found`);

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
        y: 0.2,
      },
      size: {
        x: 0.2,
        y: 0.2,
      },
      rotationDegrees: 0,
      editorGuid: uuidv4(),
    };

    setDesignState((draft) => {
      const location = findLocationInState(draft, selectedLocationId);
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
        setSelectedLocationId,
        dialogOpen,
        selectedProductData,
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
