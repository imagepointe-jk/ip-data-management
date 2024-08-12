//This intermediary controls how the editor context gets its props.
//Right now it provides them after getting them from IframeHelper, but we could change this in future if we stop using the iframe approach.
"use client";

import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";
import { Editor } from "./Editor";
import { EditorProps, EditorProvider } from "./EditorContext";

type Props = Omit<EditorProps, "initialProductId">;
export function EditorHelper({ designs, productData }: Props) {
  const iframe = useIframe();
  if (iframe.loading) return <h1>Loading...</h1>;
  if (!iframe.parentWindow.location) return <h1>Iframe error.</h1>;

  const {
    parentWindow: {
      location: { search },
    },
  } = iframe;
  const params = new URLSearchParams(search);
  const id = params.get("id");
  if (!id) return <h1>Invalid params.</h1>;

  return (
    <EditorProvider
      designs={designs}
      initialProductId={+id}
      productData={productData}
    >
      <Editor />
    </EditorProvider>
  );
}
