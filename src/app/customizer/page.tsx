import { IframeHelperProvider } from "@/components/IframeHelperProvider";
import { EditorHelper } from "./EditorHelper";

export default function Page() {
  return (
    <IframeHelperProvider>
      <EditorHelper />
    </IframeHelperProvider>
  );
}
