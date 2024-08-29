import { configureStore } from "@reduxjs/toolkit";
import { productDataSlice } from "./slices/productData";
import { editorSlice } from "./slices/editor";
import { cartSlice } from "./slices/cart";
import { designDataSlice } from "./slices/designData";

export const store = configureStore({
  reducer: {
    designData: designDataSlice.reducer,
    productData: productDataSlice.reducer,
    editorState: editorSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
