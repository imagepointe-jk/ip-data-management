"use client";

import { FullProductSettings } from "@/db/access/customizer";
import { DesignResults } from "@/types/types";
import {
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";

type EditorDialog = "colors" | "designs" | null;
type EditorContext = {
  designResults: DesignResults;
  selectedVariation: CustomProductSettingsVariation | undefined;
  selectedView: CustomProductView | undefined;
  dialogOpen: EditorDialog;
  selectedProductData: FullProductSettings | undefined;
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
  const initialVariation = initialProductData?.variations[0];
  const initialView = initialVariation?.views[0];

  const [selectedVariation, setSelectedVariation] = useState(initialVariation);
  const [selectedView, setSelectedView] = useState(initialView);
  const [dialogOpen, setDialogOpen] = useState("designs" as EditorDialog);

  return (
    <EditorContext.Provider
      value={{
        selectedVariation,
        selectedView,
        dialogOpen,
        selectedProductData: initialProductData,
        designResults,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
