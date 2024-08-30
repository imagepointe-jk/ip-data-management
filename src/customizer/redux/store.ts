import { configureStore } from "@reduxjs/toolkit";
import undoable from "redux-undo";
import { recoveryMiddleware } from "./middleware";
import { cartSlice } from "./slices/cart";
import { designDataSlice } from "./slices/designData";
import { editorSlice } from "./slices/editor";
import { productDataSlice } from "./slices/productData";

const cartUndoable = undoable(cartSlice.reducer);

export const store = configureStore({
  reducer: {
    designData: designDataSlice.reducer,
    productData: productDataSlice.reducer,
    editorState: editorSlice.reducer,
    cart: cartUndoable,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(recoveryMiddleware),
});

export type StoreType = ReturnType<typeof store.getState>;
