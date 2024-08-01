"use client";

import { getOrderApprovalIframeData } from "@/actions/orderWorkflow";
import { WooOrderView } from "@/components/WooOrderView";
import { UnwrapPromise } from "@/types/types";
import { validateOrderApprovalIframeData } from "@/types/validations/orderApproval";
import { useEffect, useState } from "react";

export default function Page() {
  const [serverData, setServerData] = useState(
    null as UnwrapPromise<ReturnType<typeof getOrderApprovalIframeData>> | null
  );

  async function onReceiveParentWindowInfo(e: any) {
    try {
      const parsed = validateOrderApprovalIframeData(e.data);
      const searchParams = new URLSearchParams(parsed.searchParams);
      const accessCodeInParams = `${searchParams.get("code")}`;
      const accessCode = await getOrderApprovalIframeData(accessCodeInParams);
      setServerData(accessCode);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    window.addEventListener("message", onReceiveParentWindowInfo);
    window.parent.postMessage({ type: "order-approval-request-url" }, "*");

    return () => {
      window.removeEventListener("message", onReceiveParentWindowInfo);
    };
  }, []);

  return (
    <>
      {!serverData && <>Loading...</>}
      {serverData && (
        <>
          <WooOrderView
            orderId={serverData.orderId}
            apiKey={serverData.apiKey}
            apiSecret={serverData.apiSecret}
            shippingMethods={serverData.shippingMethods.map(
              (method) => method.name
            )}
            storeUrl={serverData.storeUrl}
            permissions={{
              shipping: {
                method: serverData.allowApproveChangeMethod ? "edit" : "hidden",
              },
            }}
            special={{
              allowUpsShippingToCanada: serverData.allowUpsToCanada,
            }}
          />
        </>
      )}
    </>
  );
}
