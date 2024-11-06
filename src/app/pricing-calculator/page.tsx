"use client";

import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { WCProductProvider } from "./WCProductProvider";
import { PricingCalculator } from "./PricingCalculator";

export default function Page() {
  return (
    <IframeHelperProvider>
      <WCProductProvider>
        <PricingCalculator />
      </WCProductProvider>
    </IframeHelperProvider>
  );
}
