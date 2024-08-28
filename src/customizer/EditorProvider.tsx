"use client";

import { FullProductSettings } from "@/db/access/customizer";
import { DesignResults } from "@/types/schema/designs";
import { ReactNode, useEffect } from "react";
import { createInitialState, makeProductDataSerializable } from "./utils";
import { useDispatch } from "react-redux";
import { setData } from "./redux/slices/productData";

export type EditorProps = {
  initialProductId: number;
  designs: DesignResults;
  productData: FullProductSettings[];
};
export function EditorProvider({
  children,
  designs,
  initialProductId,
  productData,
}: EditorProps & { children: ReactNode }) {
  const serializableData = makeProductDataSerializable(productData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setData(serializableData));
  }, []);

  return <>{children}</>;
}

// import {
//   convertDesignerObjectData,
//   convertTransformArgs,
//   createInitialState,
//   findArtworkInState,
//   findLocationInProductData,
//   findLocationInState,
//   findLocationWithArtworkInState,
//   findVariationInState,
//   findViewInState,
// } from "@/customizer/utils";
// import { FullProductSettings } from "@/db/access/customizer";
// import {
//   DesignStateVariation,
//   EditorContext as EditorContextType,
//   EditorDialog,
//   PlacedObject,
//   TransformArgsPx,
// } from "@/types/schema/customizer";
// import { DesignResults } from "@/types/schema/designs";
// import { createContext, ReactNode, useContext, useState } from "react";
// import { useImmer } from "use-immer";
// import { v4 as uuidv4 } from "uuid";
// import { editorSize } from "./components/ProductView";

// const EditorContext = createContext(null as EditorContextType | null);

// export function useEditor() {
//   const context = useContext(EditorContext);
//   if (!context) throw new Error("No context");

//   return context;
// }

// export type EditorProps = {
//   initialProductId: number;
//   designs: DesignResults;
//   productData: FullProductSettings[];
// };
// export function EditorProvider({
//   designs: designResults,
//   initialProductId,
//   productData,
//   children,
// }: EditorProps & { children: ReactNode }) {
//   const initialProductData = productData.find(
//     (data) => data.wooCommerceId === initialProductId
//   );
//   const { initialDesignState, initialVariation, initialView, initialLocation } =
//     createInitialState(productData);

//   const [designState, setDesignState] = useImmer(initialDesignState);
//   const [selectedEditorGuid, setSelectedEditorGuid] = useState(
//     null as string | null
//   );
//   const [selectedProductData, setSelectedProductData] =
//     useState(initialProductData);
//   const [selectedVariationId, setSelectedVariationId] = useState(
//     initialVariation.id
//   );
//   const [selectedViewId, setSelectedViewId] = useState(initialView.id);
//   const [selectedLocationId, setSelectedLocationId] = useState(
//     initialLocation.id
//   );
//   const [dialogOpen, setDialogOpen] = useState(null as EditorDialog);

//   if (!selectedProductData) throw new Error(`No product selected`);
//   const selectedVariation = findVariationInState(
//     designState,
//     selectedVariationId
//   );
//   if (!selectedVariation)
//     throw new Error(`Selected variation ${selectedVariationId} not found`);
//   const selectedView = findViewInState(designState, selectedViewId);
//   if (!selectedView)
//     throw new Error(`Selected view ${selectedViewId} not found`);
//   const selectedLocation = findLocationInState(designState, selectedLocationId);
//   if (!selectedLocation)
//     throw new Error(`Selected location ${selectedLocationId} not found`);

//   function deleteArtworkFromState(guid: string) {
//     setDesignState((draft) => {
//       const locationWithArtwork = findLocationWithArtworkInState(draft, guid);
//       if (!locationWithArtwork) return;
//       locationWithArtwork.artworks = locationWithArtwork.artworks.filter(
//         (artwork) => artwork.objectData.editorGuid !== guid
//       );
//     });
//     setSelectedEditorGuid(null);
//   }

//   //expects absolute px amounts for position and size.
//   //will convert to 0-1 range for storing in state.
//   function setArtworkTransform(guid: string, transform: TransformArgsPx) {
//     const { xNormalized, yNormalized, widthNormalized, heightNormalized } =
//       convertTransformArgs(editorSize, editorSize, transform);
//     setDesignState((draft) => {
//       const artwork = findArtworkInState(draft, guid);
//       if (!artwork) return;

//       if (xNormalized) artwork.objectData.positionNormalized.x = xNormalized;
//       if (yNormalized) artwork.objectData.positionNormalized.y = yNormalized;
//       if (widthNormalized)
//         artwork.objectData.sizeNormalized.x = widthNormalized;
//       if (heightNormalized)
//         artwork.objectData.sizeNormalized.y = heightNormalized;
//       if (transform.rotationDegrees)
//         artwork.objectData.rotationDegrees = transform.rotationDegrees;
//     });
//   }

//   function addDesign(designId: number, variationId?: number) {
//     if (!selectedProductData) throw new Error("No selected product data");

//     const design = designResults.designs.find(
//       (design) => design.id === designId
//     );
//     const variation = design?.variations.find(
//       (variation) => variation.id === variationId
//     );
//     if (!design) throw new Error(`Design ${designId} not found.`);
//     if (!variation && variationId !== undefined)
//       throw new Error(
//         `Variation ${variationId} of design ${designId} not found.`
//       );

//     const locationData = findLocationInProductData(
//       selectedProductData,
//       selectedLocationId
//     );
//     if (!locationData)
//       throw new Error(
//         `Location data for location ${selectedLocationId} not found`
//       );
//     const smallestSize = [locationData.width, locationData.height].sort(
//       (a, b) => a - b
//     )[0]!;

//     const newObject: PlacedObject = {
//       positionNormalized: {
//         x: locationData.positionX,
//         y: locationData.positionY,
//       },
//       sizeNormalized: {
//         //currently only supports square images
//         //if a rectangular one is used, the aspect ratio will be forced into 1:1
//         x: smallestSize,
//         y: smallestSize,
//       },
//       rotationDegrees: 0,
//       editorGuid: uuidv4(),
//     };

//     setDesignState((draft) => {
//       const location = findLocationInState(draft, selectedLocationId);
//       if (!location) return;

//       location.artworks.push({
//         imageUrl: variation?.imageUrl || design.imageUrl,
//         identifiers: {
//           designId: design.id,
//           variationId: variation?.id,
//         },
//         objectData: newObject,
//       });
//     });

//     return newObject;
//   }

//   function addVariation(variationId: number) {
//     if (!selectedProductData) throw new Error("No selected product data");

//     const existingVariation = findVariationInState(designState, variationId);
//     if (existingVariation)
//       throw new Error(
//         `Tried to add additional instance of variation ${variationId}`
//       );

//     const variationData = selectedProductData.variations.find(
//       (variation) => variation.id === variationId
//     );
//     if (!variationData)
//       throw new Error(`Variation id ${variationId} not found`);

//     setDesignState((draft) => {
//       const product = draft.products.find(
//         (product) => product.id === selectedProductData.id
//       )!;
//       const newVariation: DesignStateVariation = {
//         id: variationData.id,
//         views: variationData.views.map((view) => ({
//           id: view.id,
//           locations: view.locations.map((location) => ({
//             id: location.id,
//             artworks: [],
//           })),
//         })),
//       };

//       product.variations.push(newVariation);
//     });

//     const firstView = variationData.views[0];
//     if (!firstView) throw new Error("No views");

//     const firstLocation = firstView.locations[0];
//     if (!firstLocation) throw new Error("No locations");

//     setSelectedVariationId(variationId);
//     setSelectedViewId(firstView.id);
//     setSelectedLocationId(firstLocation.id);
//   }

//   function removeVariation(variationId: number) {
//     if (!selectedProductData) throw new Error("No selected product data");

//     const productInState = designState.products.find(
//       (product) => product.id === selectedProductData.id
//     );
//     const variationToSelect = productInState?.variations.filter(
//       (variation) => variation.id !== variationId
//     )[0];
//     if (!variationToSelect) throw new Error("Can't delete last variation");

//     const viewToSelect = variationToSelect.views[0];
//     if (!viewToSelect) throw new Error("No view to select");

//     const locationToSelect = viewToSelect.locations[0];
//     if (!locationToSelect) throw new Error("No location to select");

//     setDesignState((draft) => {
//       const product = draft.products.find(
//         (product) => product.id === selectedProductData.id
//       );
//       if (!product) return;

//       product.variations = product.variations.filter(
//         (variation) => variation.id !== variationId
//       );
//     });

//     setSelectedVariationId(variationToSelect.id);
//     setSelectedViewId(viewToSelect.id);
//     setSelectedLocationId(locationToSelect.id);
//   }

//   return (
//     <EditorContext.Provider
//       value={{
//         selectedEditorGuid,
//         setSelectedEditorGuid,
//         designState,
//         selectedVariation,
//         selectedView,
//         selectedLocation,
//         setSelectedLocationId,
//         dialogOpen,
//         selectedProductData,
//         designResults,
//         setDialogOpen,
//         deleteArtworkFromState,
//         setArtworkTransform,
//         addDesign,
//         addVariation,
//         removeVariation,
//       }}
//     >
//       {children}
//     </EditorContext.Provider>
//   );
// }
