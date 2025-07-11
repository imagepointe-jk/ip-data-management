import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { StoreType } from "../store";
import {
  CartState,
  EditorDialog,
  EditorModal,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import {
  findVariationInCart,
  findViewInCart,
  getAdjacentViewId,
} from "@/customizer/utils/find";

type EditorState = {
  dialogOpen: EditorDialog;
  modalOpen: EditorModal;
  selectedEditorGuid: string | null;
  selectedProductId: number;
  selectedVariationId: number;
  selectedViewId: number;
  designBrowserData: {
    search: string;
    page: number;
  };
};
const initialState: EditorState = {
  dialogOpen: null,
  modalOpen: null,
  selectedEditorGuid: null,
  selectedProductId: -1,
  selectedVariationId: -1,
  selectedViewId: -1,
  designBrowserData: {
    page: 1,
    search: "",
  },
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setDialogOpen: (state, action: PayloadAction<EditorDialog>) => {
      state.dialogOpen = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<EditorModal>) => {
      state.modalOpen = action.payload;
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
    setDesignBrowserPage: (state, action: PayloadAction<number>) => {
      state.designBrowserData.page = action.payload;
    },
    setDesignBrowserSearch: (state, action: PayloadAction<string>) => {
      state.designBrowserData.search = action.payload;
    },
    selectNextView: (
      state,
      action: PayloadAction<{
        productData: PopulatedProductSettingsSerializable;
      }>
    ) => {
      const { productData } = action.payload;
      const { selectedVariationId, selectedViewId } = state;
      const { viewId } = getAdjacentViewId(
        productData,
        selectedVariationId,
        selectedViewId,
        "next"
      );

      state.selectedViewId = viewId;
      state.selectedEditorGuid = null;
    },
    selectPreviousView: (
      state,
      action: PayloadAction<{
        productData: PopulatedProductSettingsSerializable;
      }>
    ) => {
      const { productData } = action.payload;
      const { selectedVariationId, selectedViewId } = state;
      const { viewId } = getAdjacentViewId(
        productData,
        selectedVariationId,
        selectedViewId,
        "previous"
      );

      state.selectedViewId = viewId;
      state.selectedEditorGuid = null;
    },
  },
});

//shared logic for getting the id of the previous or next view

export function useEditorSelectors() {
  const {
    dialogOpen,
    selectedEditorGuid,
    selectedProductId,
    selectedVariationId,
    selectedViewId,
    designBrowserData,
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

  if (!selectedProductData)
    throw new Error(`Invalid product id ${selectedProductId} selected`);
  if (!selectedVariation)
    throw new Error(`Invalid variation id ${selectedVariationId} selected`);
  if (!selectedView)
    throw new Error(`Invalid view id ${selectedViewId} selected`);

  return {
    dialogOpen,
    selectedEditorGuid,
    selectedProductData,
    selectedVariation,
    selectedView,
    allProductData: data,
    designBrowserData,
  };
}

export const {
  setDialogOpen,
  setModalOpen,
  setSelectedEditorGuid,
  setSelectedProductId,
  setSelectedVariationId,
  setSelectedViewId,
  selectNextView,
  selectPreviousView,
  setDesignBrowserPage,
  setDesignBrowserSearch,
} = editorSlice.actions;
