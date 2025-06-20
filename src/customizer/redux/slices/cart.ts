import { CartState } from "@/types/schema/customizer";
import { createSlice } from "@reduxjs/toolkit";
import {
  deleteArtworkFromState as deleteArtworkFromStateFn,
  addDesign as addDesignFn,
} from "@/customizer/redux/slices/reducers/cart/artwork";
import {
  setCartProducts as setCartProductsFn,
  addProductVariation as addProductVariationFn,
  removeProductVariation as removeProductVariationFn,
  changeProductVariationQuantities as changeProductVariationQuantitiesFn,
  pruneCart as pruneCartFn,
} from "@/customizer/redux/slices/reducers/cart/cart";
import {
  deleteTextFromState as deleteTextFromStateFn,
  addText as addTextFn,
  editText as editTextFn,
} from "@/customizer/redux/slices/reducers/cart/text";
import { setObjectTransform as setObjectTransformFn } from "@/customizer/redux/slices/reducers/cart/object";
import { setViewRenderURL as setViewRenderURLFn } from "@/customizer/redux/slices/reducers/cart/misc";

const initialState: CartState = {
  products: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartProducts: setCartProductsFn,
    deleteArtworkFromState: deleteArtworkFromStateFn,
    deleteTextFromState: deleteTextFromStateFn,
    setObjectTransform: setObjectTransformFn,
    addDesign: addDesignFn,
    addText: addTextFn,
    editText: editTextFn,
    addProductVariation: addProductVariationFn,
    removeProductVariation: removeProductVariationFn,
    changeProductVariationQuantities: changeProductVariationQuantitiesFn,
    setViewRenderURL: setViewRenderURLFn,
    pruneCart: pruneCartFn,
  },
});

export const {
  setCartProducts,
  addDesign,
  addText,
  addProductVariation,
  deleteArtworkFromState,
  deleteTextFromState,
  removeProductVariation,
  changeProductVariationQuantities,
  setObjectTransform,
  editText,
  setViewRenderURL,
  pruneCart,
} = cartSlice.actions;
