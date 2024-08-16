"use client";

import {
  convertDesignerObjectData,
  convertTransformArgs,
} from "@/customizer/editor";
import { FullProductSettings } from "@/db/access/customizer";
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
type DesignState = {
  artworks: {
    imageUrl: string;
    objectData: PlacedObject;
  }[];
};
type EditorContext = {
  designResults: DesignResults;
  designState: DesignState;
  selectedEditorGuid: string | null;
  setSelectedEditorGuid: (guid: string | null) => void;
  selectedVariation: CustomProductSettingsVariation | undefined;
  selectedView: CustomProductView | undefined;
  dialogOpen: EditorDialog;
  setDialogOpen: (dialog: EditorDialog) => void;
  selectedProductData: FullProductSettings | undefined;
  deleteArtworkFromState: (guid: string) => void;
  setArtworkTransform: (guid: string, transform: TransformArgs) => void;
  addDesign: (designId: number) => PlacedObject;
};

const EditorContext = createContext(null as EditorContext | null);
const initialStateTest: DesignState = {
  artworks: [],
};

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
  const initialVariation = initialProductData?.variations[0];
  const initialView = initialVariation?.views[0];

  const [designState, setDesignState] = useImmer(initialStateTest);
  const [selectedEditorGuid, setSelectedEditorGuid] = useState(
    null as string | null
  );
  const [selectedVariation, setSelectedVariation] = useState(initialVariation);
  const [selectedView, setSelectedView] = useState(initialView);
  const [dialogOpen, setDialogOpen] = useState(null as EditorDialog);

  function deleteArtworkFromState(guid: string) {
    setDesignState((draft) => {
      draft.artworks = draft.artworks.filter(
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
      const artwork = draft.artworks.find(
        (artwork) => artwork.objectData.editorGuid === guid
      );
      if (!artwork) return;

      if (x) artwork.objectData.position.x = x;
      if (y) artwork.objectData.position.y = y;
      if (width) artwork.objectData.size.x = width;
      if (height) artwork.objectData.size.y = height;
      if (transform.rotationDegrees)
        artwork.objectData.rotationDegrees = transform.rotationDegrees;
    });
  }

  function addDesign(designId: number) {
    const design = designResults.designs.find(
      (design) => design.id === designId
    );
    if (!design) throw new Error(`Design ${designId} not found.`);

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
      draft.artworks.push({
        imageUrl: design.imageUrl,
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
