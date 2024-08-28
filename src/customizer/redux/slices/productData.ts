import { FullProductSettings } from "@/db/access/customizer";
import { DesignState } from "@/types/schema/customizer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FullProductSettingsSerializable = Omit<
  FullProductSettings,
  "createdAt" | "updatedAt"
> & { createdAt: string; updatedAt: string };
const initialState: { data: FullProductSettingsSerializable[] | null } = {
  data: null,
};

export const dataSlice = createSlice({
  name: "productData",
  initialState,
  reducers: {
    setData: (
      state,
      action: PayloadAction<FullProductSettingsSerializable[]>
    ) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = dataSlice.actions;
