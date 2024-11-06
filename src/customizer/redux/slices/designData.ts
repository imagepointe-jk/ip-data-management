import { DesignResults, DesignWithIncludes } from "@/types/schema/designs";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { StoreType } from "../store";

export type DesignWithIncludesSerializable = Omit<
  DesignWithIncludes,
  "date"
> & { date: string };
export type DesignResultsSerializable = Omit<DesignResults, "designs"> & {
  designs: DesignWithIncludesSerializable[];
};
const initialState: { data: DesignResultsSerializable | null } = {
  data: null,
};

export const designDataSlice = createSlice({
  name: "designData",
  initialState,
  reducers: {
    setDesignData: (
      state,
      action: PayloadAction<DesignResultsSerializable>
    ) => {
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
