import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { StoreType } from "../store";
import {
  findLocationInCart,
  findVariationInCart,
  findViewInCart,
} from "@/customizer/utils";

type EditorDialog = "colors" | "designs" | "upload" | null;
type EditorState = {
  dialogOpen: EditorDialog;
  selectedEditorGuid: string | null;
  selectedProductId: number;
  selectedVariationId: number;
  selectedViewId: number;
  selectedLocationId: number;
};
const initialState: EditorState = {
  dialogOpen: null,
  selectedEditorGuid: null,
  selectedProductId: -1,
  selectedVariationId: -1,
  selectedViewId: -1,
  selectedLocationId: -1,
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setDialogOpen: (state, action: PayloadAction<EditorDialog>) => {
      state.dialogOpen = action.payload;
    },
    setSelectedEditorGuid: (state, action: PayloadAction<string | null>) => {
      state.selectedEditorGuid = action.payload;
    },
    setSelectedProductId: (state, action: PayloadAction<number>) => {
      state.selectedProductId = action.payload;
    },
    setSelectedVariationId: (state, action: PayloadAction<number>) => {
      state.selectedVariationId = action.payload;
    },
    setSelectedViewId: (state, action: PayloadAction<number>) => {
      state.selectedViewId = action.payload;
    },
    setSelectedLocationId: (state, action: PayloadAction<number>) => {
      state.selectedLocationId = action.payload;
    },
  },
});

export function useEditorSelectors() {
  const {
    dialogOpen,
    selectedEditorGuid,
    selectedProductId,
    selectedLocationId,
    selectedVariationId,
    selectedViewId,
  } = useSelector((state: StoreType) => state.editorState);
  const state = useSelector((state: StoreType) => state.cart);
  const { data } = useSelector((state: StoreType) => state.productData);
  if (!data) throw new Error("No product data");

  const selectedProductData = data.find(
    (product) => product.id === selectedProductId
  );
  const selectedVariation = findVariationInCart(
    state.present,
    selectedVariationId
  );
  const selectedView = findViewInCart(state.present, selectedViewId);
  const selectedLocation = findLocationInCart(
    state.present,
    selectedLocationId
  );

  if (!selectedProductData)
    throw new Error(`Invalid product id ${selectedProductId} selected`);
  if (!selectedVariation)
    throw new Error(`Invalid variation id ${selectedVariationId} selected`);
  if (!selectedView)
    throw new Error(`Invalid view id ${selectedViewId} selected`);
  if (!selectedLocation)
    throw new Error(`Invalid location id ${selectedLocationId} selected`);

  return {
    dialogOpen,
    selectedEditorGuid,
    selectedProductData,
    selectedVariation,
    selectedView,
    selectedLocation,
  };
}

export const {
  setDialogOpen,
  setSelectedEditorGuid,
  setSelectedLocationId,
  setSelectedProductId,
  setSelectedVariationId,
  setSelectedViewId,
} = editorSlice.actions;
