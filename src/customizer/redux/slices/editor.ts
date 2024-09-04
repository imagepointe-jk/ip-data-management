import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { StoreType } from "../store";
import {
  findLocationInCart,
  findVariationInCart,
  findViewInCart,
} from "@/customizer/utils";
import {
  CartState,
  EditorDialog,
  EditorModal,
} from "@/types/schema/customizer";
import { wrap } from "@/utility/misc";

type EditorState = {
  dialogOpen: EditorDialog;
  modalOpen: EditorModal;
  selectedEditorGuid: string | null;
  selectedProductId: number;
  selectedVariationId: number;
  selectedViewId: number;
  selectedLocationId: number;
};
const initialState: EditorState = {
  dialogOpen: null,
  modalOpen: null,
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
    setSelectedLocationId: (state, action: PayloadAction<number>) => {
      state.selectedLocationId = action.payload;
    },
    selectNextView: (state, action: PayloadAction<{ cart: CartState }>) => {
      const { cart } = action.payload;
      const { selectedVariationId, selectedViewId } = state;
      const { viewId, firstLocationId } = getAdjacentViewId(
        cart,
        selectedVariationId,
        selectedViewId,
        "next"
      );

      state.selectedViewId = viewId;
      state.selectedEditorGuid = null;
      state.selectedLocationId = firstLocationId;
    },
    selectPreviousView: (state, action: PayloadAction<{ cart: CartState }>) => {
      const { cart } = action.payload;
      const { selectedVariationId, selectedViewId } = state;
      const { viewId, firstLocationId } = getAdjacentViewId(
        cart,
        selectedVariationId,
        selectedViewId,
        "previous"
      );

      state.selectedViewId = viewId;
      state.selectedEditorGuid = null;
      state.selectedLocationId = firstLocationId;
    },
  },
});

//shared logic for getting the id of the previous or next view
function getAdjacentViewId(
  cart: CartState,
  selectedVariationId: number,
  selectedViewId: number,
  direction: "previous" | "next"
) {
  const variation = findVariationInCart(cart, selectedVariationId);
  if (!variation)
    throw new Error(`Invalid variation id ${selectedVariationId} selected.`);

  const curIndex = variation.views.findIndex(
    (view) => view.id === selectedViewId
  );
  if (curIndex === -1)
    throw new Error(`Invalid view id ${selectedViewId} selected.`);

  const newIndex = wrap(
    direction === "previous" ? curIndex - 1 : curIndex + 1,
    0,
    variation.views.length - 1
  );
  const newView = variation.views[newIndex]!;
  const firstLocation = newView.locations[0];
  if (!firstLocation) throw new Error("No locations");

  return {
    viewId: newView.id,
    firstLocationId: firstLocation.id,
  };
}

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
    allProductData: data,
  };
}

export const {
  setDialogOpen,
  setModalOpen,
  setSelectedEditorGuid,
  setSelectedLocationId,
  setSelectedProductId,
  setSelectedVariationId,
  setSelectedViewId,
  selectNextView,
  selectPreviousView,
} = editorSlice.actions;
