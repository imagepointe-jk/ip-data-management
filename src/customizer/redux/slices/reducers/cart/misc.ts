import { findViewInCart } from "@/customizer/utils/find";
import { CartState } from "@/types/schema/customizer";
import { PayloadAction } from "@reduxjs/toolkit";

export function setViewRenderURL(
  state: CartState,
  action: PayloadAction<{ viewId: number; url: string }>
) {
  const { url, viewId } = action.payload;
  const view = findViewInCart(state, viewId);
  if (!view) throw new Error(`View id ${viewId} not found`);

  view.currentRenderUrl = url;
}
