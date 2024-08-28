"use client";

import {
  convertDesignerObjectData,
  convertTransformArgs,
  createInitialState,
  findArtworkInState,
  findLocationInProductData,
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
  TransformArgsPx,
} from "@/types/schema/customizer";
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
  function setArtworkTransform(guid: string, transform: TransformArgsPx) {
    const { xNormalized, yNormalized, widthNormalized, heightNormalized } =
      convertTransformArgs(editorSize, editorSize, transform);
    setDesignState((draft) => {
      const artwork = findArtworkInState(draft, guid);
      if (!artwork) return;

      if (xNormalized) artwork.objectData.positionNormalized.x = xNormalized;
      if (yNormalized) artwork.objectData.positionNormalized.y = yNormalized;
      if (widthNormalized)
        artwork.objectData.sizeNormalized.x = widthNormalized;
      if (heightNormalized)
        artwork.objectData.sizeNormalized.y = heightNormalized;
      if (transform.rotationDegrees)
        artwork.objectData.rotationDegrees = transform.rotationDegrees;
    });
  }

  function addDesign(designId: number, variationId?: number) {
    if (!selectedProductData) throw new Error("No selected product data");

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

    const locationData = findLocationInProductData(
      selectedProductData,
      selectedLocationId
    );
    if (!locationData)
      throw new Error(
        `Location data for location ${selectedLocationId} not found`
      );
    const smallestSize = [locationData.width, locationData.height].sort(
      (a, b) => a - b
    )[0]!;

    const newObject: PlacedObject = {
      positionNormalized: {
        x: locationData.positionX,
        y: locationData.positionY,
      },
      sizeNormalized: {
        //currently only supports square images
        //if a rectangular one is used, the aspect ratio will be forced into 1:1
        x: smallestSize,
        y: smallestSize,
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
