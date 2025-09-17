// import { PopulatedProductSettingsSerializable } from "@/types/schema/customizer";
import { PopulatedProductSettings } from "@/types/dto/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { data: PopulatedProductSettings[] | null } = {
  data: null,
};

export const productDataSlice = createSlice({
  name: "productData",
  initialState,
  reducers: {
    setProductData: (
      state,
      action: PayloadAction<PopulatedProductSettings[]>
    ) => {
      state.data = action.payload;
    },
  },
});

export const { setProductData } = productDataSlice.actions;
