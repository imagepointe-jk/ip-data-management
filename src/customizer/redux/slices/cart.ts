import { CartState } from "@/types/schema/customizer";
import { createSlice } from "@reduxjs/toolkit";
import { addDesign as addDesignFn } from "@/customizer/redux/slices/reducers/cart/artwork";
import {
  setCartProducts as setCartProductsFn,
  addProductVariation as addProductVariationFn,
  removeProductVariation as removeProductVariationFn,
  deleteObjectFromState as deleteObjectFromStateFn,
  changeProductVariationQuantities as changeProductVariationQuantitiesFn,
  pruneCart as pruneCartFn,
  copyDesign as copyDesignFn,
  setComments as setCommentsFn,
  setCompany as setCompanyFn,
  setEmail as setEmailFn,
  setFirstName as setFirstNameFn,
  setLastName as setLastNameFn,
  setLocal as setLocalFn,
  setPhone as setPhoneFn,
} from "@/customizer/redux/slices/reducers/cart/cart";
import {
  addText as addTextFn,
  editText as editTextFn,
} from "@/customizer/redux/slices/reducers/cart/text";
import { setObjectTransform as setObjectTransformFn } from "@/customizer/redux/slices/reducers/cart/object";
import { setViewRenderURL as setViewRenderURLFn } from "@/customizer/redux/slices/reducers/cart/misc";

const initialState: CartState = {
  products: [],
  contactInfo: {
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    local: "",
    phone: "",
    comments: "",
  },
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartProducts: setCartProductsFn,
    deleteObjectFromState: deleteObjectFromStateFn,
    setObjectTransform: setObjectTransformFn,
    addDesign: addDesignFn,
    addText: addTextFn,
    editText: editTextFn,
    addProductVariation: addProductVariationFn,
    removeProductVariation: removeProductVariationFn,
    changeProductVariationQuantities: changeProductVariationQuantitiesFn,
    setViewRenderURL: setViewRenderURLFn,
    pruneCart: pruneCartFn,
    copyDesign: copyDesignFn,
    setFirstName: setFirstNameFn,
    setLastName: setLastNameFn,
    setEmail: setEmailFn,
    setCompany: setCompanyFn,
    setLocal: setLocalFn,
    setPhone: setPhoneFn,
    setComments: setCommentsFn,
  },
});

export const {
  setCartProducts,
  addDesign,
  addText,
  addProductVariation,
  deleteObjectFromState,
  removeProductVariation,
  changeProductVariationQuantities,
  setObjectTransform,
  editText,
  setViewRenderURL,
  pruneCart,
  copyDesign,
  setComments,
  setCompany,
  setEmail,
  setFirstName,
  setLastName,
  setLocal,
  setPhone,
} = cartSlice.actions;
