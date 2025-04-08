import { isAction, Middleware } from "@reduxjs/toolkit";
import { StoreType } from "./store";
import {
  setSelectedEditorGuid,
  setSelectedProductId,
  setSelectedVariationId,
  setSelectedViewId,
} from "./slices/editor";
import { findVariationInCart, findViewInCart } from "../utils/find";

//did not find a good way with redux-undo to resolve some post-undo/post-redo states.
//for example, after adding a design and selecting it, undoing the add would leave the (now non-existent) design still selected by reference.
//use this to try and resolve any invalid states that might occur after an undo or redo.
//also serves as fallback in case any other actions might cause invalid states.
export const recoveryMiddleware: Middleware =
  (storeAPI) => (next) => (action) => {
    if (
      isAction(action) &&
      ["@@redux-undo/UNDO", "@@redux-undo/REDO"].includes(action.type)
    ) {
      const result = next(action);
      const state = storeAPI.getState() as StoreType;
      const dispatch = storeAPI.dispatch;

      //handles case where "add design" is undone, so that the nonexistent designs' guid is no longer referenced
      storeAPI.dispatch(setSelectedEditorGuid(null));

      //tries to select fallback products/variations/views/locations in case any of these are invalid
      const { selectedProductId, selectedVariationId, selectedViewId } =
        state.editorState;
      const cart = state.cart.present;

      let selectedProduct = cart.products.find(
        (product) => product.id === selectedProductId
      );
      if (!selectedProduct) {
        const firstProduct = cart.products[0];
        if (!firstProduct) throw new Error("Cart has no products!");
        dispatch(setSelectedProductId(firstProduct.id));
        selectedProduct = firstProduct;
      }

      let selectedVariation = findVariationInCart(cart, selectedVariationId);
      if (!selectedVariation) {
        let firstVariation = selectedProduct.variations[0];
        if (!firstVariation)
          throw new Error(`Product ${selectedProduct.id} has no variations!`);
        dispatch(setSelectedVariationId(firstVariation.id));
        selectedVariation = firstVariation;
      }

      let selectedView = findViewInCart(cart, selectedViewId);
      if (!selectedView) {
        let firstView = selectedVariation.views[0];
        if (!firstView)
          throw new Error(`Variation ${selectedVariation.id} has no views!`);
        dispatch(setSelectedViewId(firstView.id));
        selectedView = firstView;
      }

      return result;
    }
    return next(action);
  };
