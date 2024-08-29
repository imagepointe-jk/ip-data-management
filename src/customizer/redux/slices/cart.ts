import { DesignState, TransformArgsPx } from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: DesignState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartProducts: (state, action: PayloadAction<DesignState>) => {
      state.products = action.payload.products;
    },
    deleteArtworkFromState: (
      state,
      action: PayloadAction<{ guid: string }>
    ) => {
      console.log("delete guid", action.payload.guid);
    },
    setArtworkTransform: (
      state,
      action: PayloadAction<{ guid: string; transform: TransformArgsPx }>
    ) => {
      console.log("set transform");
    },
    addDesign: (
      state,
      action: PayloadAction<{ designId: number; variationId?: number }>
    ) => {
      console.log("add design", action.payload.designId);
    },
    addVariation: (state, action: PayloadAction<{ variationId: number }>) => {},
    removeVariation: (
      state,
      action: PayloadAction<{ variationId: number }>
    ) => {},
  },
});

export const {
  setCartProducts,
  addDesign,
  addVariation,
  deleteArtworkFromState,
  removeVariation,
  setArtworkTransform,
} = cartSlice.actions;
