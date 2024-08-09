import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { EditorHelper } from "./EditorHelper";

export default function Page() {
  return (
    <IframeHelperProvider>
      <EditorHelper />
    </IframeHelperProvider>
  );
}
