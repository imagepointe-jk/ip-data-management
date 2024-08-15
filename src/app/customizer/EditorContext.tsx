"use client";

import { FullProductSettings } from "@/db/access/customizer";
import { PlacedObject } from "@/types/customizer";
import { DesignResults } from "@/types/types";
import {
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";
import { useImmer } from "use-immer";

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
};

const EditorContext = createContext(null as EditorContext | null);
const initialStateTest: DesignState = {
  artworks: [
    {
      imageUrl:
        "https://www.imagepointe.com/wp-content/uploads/2024/02/857.jpg",
      objectData: {
        editorGuid: "abc",
        position: {
          x: 0.1,
          y: 0.2,
        },
        rotationDegrees: 20,
        size: {
          x: 0.4,
          y: 0.3,
        },
      },
    },
    {
      imageUrl:
        "https://www.imagepointe.com/wp-content/uploads/2024/02/857.jpg",
      objectData: {
        editorGuid: "def",
        position: {
          x: 0.4,
          y: 0.4,
        },
        rotationDegrees: -20,
        size: {
          x: 0.2,
          y: 0.1,
        },
      },
    },
  ],
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
  const [dialogOpen, setDialogOpen] = useState("designs" as EditorDialog);

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
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
