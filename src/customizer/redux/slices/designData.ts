import { DesignResults } from "@/types/schema/designs";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { StoreType } from "../store";

const initialState: { data: DesignResults | null } = {
  data: null,
};

export const designDataSlice = createSlice({
  name: "designData",
  initialState,
  reducers: {
    setDesignData: (state, action: PayloadAction<DesignResults>) => {
      state.data = action.payload;
    },
  },
});

export function useDesignDataSelector() {
  const designData = useSelector((store: StoreType) => store.designData);
  if (!designData.data) throw new Error("No design data");

  return designData.data;
}

export const { setDesignData } = designDataSlice.actions;
