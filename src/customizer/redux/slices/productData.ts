import { PopulatedProductSettingsSerializable } from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { data: PopulatedProductSettingsSerializable[] | null } = {
  data: null,
};

export const productDataSlice = createSlice({
  name: "productData",
  initialState,
  reducers: {
    setProductData: (
      state,
      action: PayloadAction<PopulatedProductSettingsSerializable[]>
    ) => {
      state.data = action.payload;
    },
  },
});

export const { setProductData } = productDataSlice.actions;
