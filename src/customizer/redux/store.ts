import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./slices";

export const store = configureStore({
  reducer: {
    productData: dataSlice.reducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
