import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./slices/productData";
import { editorSlice } from "./slices/editor";
import { cartSlice } from "./slices/cart";

export const store = configureStore({
  reducer: {
    productData: dataSlice.reducer,
    editorState: editorSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
