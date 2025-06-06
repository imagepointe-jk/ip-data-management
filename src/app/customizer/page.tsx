import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import dynamic from "next/dynamic";
const EditorHelper = dynamic(() => import("@/customizer/EditorHelper"), {
  ssr: !!false,
}); //this is the recommended workaround for errors related to combining Next.js and Konva
//recommended by Konva dev here: https://github.com/konvajs/react-konva#usage-with-nextjs
//the !!false appears to be a temporary workaround for Next.js 15: https://github.com/PostHog/posthog/issues/26016
import { getDesigns } from "@/db/access/designs";
import { getProductSettingsWithIncludes } from "@/db/access/customizer";
import { populateProductData } from "@/app/customizer/handleData";

export default async function Page() {
  //given the current size of our data, there is nothing wrong with getting all designs/products on load and sending to client
  //reconsider if data ever gets much bigger
  const designs = await getDesigns({
    perPage: 9999,
  });
  const settings = await getProductSettingsWithIncludes({
    publishedOnly: true,
  });
  const productData = await populateProductData(settings);

  return (
    <IframeHelperProvider>
      <EditorHelper designs={designs} productData={productData} />
    </IframeHelperProvider>
  );
}
