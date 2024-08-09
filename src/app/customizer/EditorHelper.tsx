//This intermediary controls how the editor gets its props.
//Right now it provides them after getting them from IframeHelper, but we could change this in future if we stop using the iframe approach.
"use client";

import { useIframe } from "@/components/IframeHelperProvider";
import { Editor } from "./Editor";

export function EditorHelper() {
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

  console.log("Hi normal", id);
  iframe.parentWindow.console.log("Hi parent", id);
  return <Editor customProductId={+id} />;
}
