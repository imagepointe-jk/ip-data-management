//This intermediary controls how the editor context gets its props.
//Right now it provides them after getting them from IframeHelper, but we could change this in future if we stop using the iframe approach.
"use client";

import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import { Editor } from "./Editor";
import { EditorProps, EditorProvider } from "./EditorProvider";
import { Provider } from "react-redux";
import { store } from "./redux/store";

type Props = Omit<EditorProps, "initialProductId">;
export default function EditorHelper({ designs, productData }: Props) {
  const iframe = useIframe();
  if (iframe.loading) return <h1>Loading...</h1>;

  const search = iframe.parentWindow.location?.search || window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get("id");
  if (!id) return <h1>Invalid params.</h1>;

  return (
    <Provider store={store}>
      <EditorProvider
        designs={designs}
        initialProductId={+id}
        productData={productData}
      >
        <Editor />
      </EditorProvider>
    </Provider>
  );
}
