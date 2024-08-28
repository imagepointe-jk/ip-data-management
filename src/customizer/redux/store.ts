import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./slices/productData";
import { editorSlice } from "./slices/editor";

export const store = configureStore({
  reducer: {
    productData: dataSlice.reducer,
    editorState: editorSlice.reducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
