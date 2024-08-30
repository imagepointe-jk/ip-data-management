import { FullProductSettings } from "@/db/access/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FullProductSettingsSerializable = Omit<
  FullProductSettings,
  "createdAt" | "updatedAt"
> & { createdAt: string; updatedAt: string };
const initialState: { data: FullProductSettingsSerializable[] | null } = {
  data: null,
};

export const productDataSlice = createSlice({
  name: "productData",
  initialState,
  reducers: {
    setProductData: (
      state,
      action: PayloadAction<FullProductSettingsSerializable[]>
    ) => {
      state.data = action.payload;
    },
  },
});

export const { setProductData } = productDataSlice.actions;
