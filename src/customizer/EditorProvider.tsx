"use client";

import { DesignResults } from "@/types/schema/designs";
import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  createInitialState,
  getCurrentViewDataURL,
  makeDesignResultsSerializable,
  makeProductDataSerializable,
} from "./utils";
import { useDispatch } from "react-redux";
import { setProductData } from "./redux/slices/productData";
import { setCartProducts, setViewRenderURL } from "./redux/slices/cart";
import { useSelector } from "react-redux";
import { StoreType } from "./redux/store";
import {
  setSelectedEditorGuid,
  // setSelectedLocationId,
  setSelectedProductId,
  setSelectedVariationId,
  setSelectedViewId,
} from "./redux/slices/editor";
import { setDesignData } from "./redux/slices/designData";
import { ActionCreators } from "redux-undo";
import { PopulatedProductSettings } from "@/types/schema/customizer";

type EditorContextType = {
  updateViewRender: (viewId: number) => void;
};

const EditorContext = createContext(null as EditorContextType | null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("No EditorContext");

  return context;
}

export type EditorProps = {
  initialProductId: number;
  initialVariationId: number;
  designs: DesignResults;
  productData: PopulatedProductSettings[];
};
export function EditorProvider({
  children,
  designs,
  initialProductId,
  initialVariationId,
  productData,
}: EditorProps & { children: ReactNode }) {
  const dispatch = useDispatch();
  const productDataInStore = useSelector(
    (state: StoreType) => state.productData
  );

  function updateViewRender(viewId: number) {
    dispatch(setSelectedEditorGuid(null)); //deselect any selected objects, otherwise the transform widget will get into the render
    const url = getCurrentViewDataURL();
    dispatch(setViewRenderURL({ viewId, url })); //store the rendered canvas dataURL in state
  }

  useEffect(() => {
    //set initial state
    const {
      initialLocation,
      initialVariation,
      initialView,
      initialProduct,
      initialDesignState,
    } = createInitialState(productData, initialProductId, initialVariationId);
    const serializableData = makeProductDataSerializable(productData);
    const serializableDesigns = makeDesignResultsSerializable(designs);

    dispatch(setProductData(serializableData));
    dispatch(setDesignData(serializableDesigns));
    dispatch(setCartProducts(initialDesignState));
    dispatch(setSelectedProductId(initialProduct.id));
    dispatch(setSelectedVariationId(initialVariation.id));
    dispatch(setSelectedViewId(initialView.id));
    // dispatch(setSelectedLocationId(initialLocation.id));

    //don't remember the above actions as undoable history
    dispatch(ActionCreators.clearHistory());
  }, []);

  //don't render the editor until the above useEffect has stored necessary data in redux
  if (productDataInStore.data === null) return <></>;

  return (
    <EditorContext.Provider value={{ updateViewRender }}>
      {children}
    </EditorContext.Provider>
  );
}
