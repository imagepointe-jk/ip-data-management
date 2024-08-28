import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type EditorDialog = "colors" | "designs" | "upload" | null;
type EditorState = {
  dialogOpen: EditorDialog;
};
const initialState: EditorState = {
  dialogOpen: null,
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setDialogOpen: (state, action: PayloadAction<EditorDialog>) => {
      state.dialogOpen = action.payload;
    },
  },
});

export const { setDialogOpen } = editorSlice.actions;
