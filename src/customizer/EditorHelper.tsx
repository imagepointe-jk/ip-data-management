"use client";

import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import { Editor } from "./Editor";
import { EditorProps, EditorProvider } from "./EditorProvider";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useEffect, useState } from "react";
import { StarterSteps } from "./components/StarterSteps";

type Props = Omit<EditorProps, "initialProductId">;
export default function EditorHelper({ designs, productData }: Props) {
  const iframe = useIframe();
  const [initialProductId, setInitialProductId] = useState(
    null as number | null
  );
  const [initialVariationId, setInitialVariationId] = useState(
    null as number | null
  );

  const search = iframe.parentWindow.location?.search || window.location.search;

  function onCompleteStarterSteps(
    chosenProductId: number,
    chosenVariationId: number
  ) {
    setInitialProductId(chosenProductId);
    setInitialVariationId(chosenVariationId);
  }

  useEffect(() => {
    if (search === "") return;

    const params = new URLSearchParams(search);
    const id = params.get("id");
    if (!isNaN(+`${id}`)) setInitialProductId(+`${id}`);
  }, [search]);

  if (initialProductId === null || initialVariationId === null)
    return (
      <StarterSteps
        productData={productData}
        initialProductId={initialProductId}
        onCompleteSteps={onCompleteStarterSteps}
      />
    );

  return (
    <Provider store={store}>
      <EditorProvider
        designs={designs}
        initialProductId={initialProductId}
        initialVariationId={initialVariationId}
        productData={productData}
      >
        <Editor />
      </EditorProvider>
    </Provider>
  );
}
