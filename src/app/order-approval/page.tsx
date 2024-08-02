"use client";

import { getOrderApprovalIframeData } from "@/actions/orderWorkflow";
import { WooOrderView } from "@/components/WooOrderView";
import { UnwrapPromise } from "@/types/types";
import { validateOrderApprovalIframeData } from "@/types/validations/orderApproval";
import { useEffect, useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import { waitForMs } from "@/utility/misc";

type Action = "approve" | "deny" | null;
export default function Page() {
  const [serverData, setServerData] = useState(
    null as UnwrapPromise<ReturnType<typeof getOrderApprovalIframeData>> | null
  );
  const [loading, setLoading] = useState(true);
  const [actionRequest, setActionRequest] = useState(null as Action);
  const [actionSuccess, setActionSuccess] = useState(false);

  async function onReceiveParentWindowInfo(e: any) {
    try {
      const parsed = validateOrderApprovalIframeData(e.data);
      const searchParams = new URLSearchParams(parsed.searchParams);
      const accessCodeInParams = `${searchParams.get("code")}`;
      const dataFromServer = await getOrderApprovalIframeData(
        accessCodeInParams
      );

      const action = searchParams.get("action");
      setServerData(dataFromServer);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    window.addEventListener("message", onReceiveParentWindowInfo);
    window.parent.postMessage({ type: "order-approval-request-url" }, "*");

    return () => {
      window.removeEventListener("message", onReceiveParentWindowInfo);
    };
  }, []);

  useEffect(() => {
    async function doApprove() {
      setLoading(true);
      await waitForMs(3000);
      setActionSuccess(false);
      setLoading(false);
    }

    if (actionRequest === "approve") doApprove();
  }, [actionRequest]);

  return (
    <>
      {loading && <>Loading...</>}
      {!serverData && !loading && <>Error.</>}
      {serverData && (
        <div className={styles["main"]}>
          {/* Only show the buttons if an action hasn't been successfully performed yet */}
          {!actionSuccess && (
            <>
              <button onClick={() => setActionRequest(null)}>Review</button>
              <button onClick={() => setActionRequest("approve")}>
                Approve
              </button>
              <button onClick={() => setActionRequest("deny")}>Deny</button>
            </>
          )}
          {actionRequest === "approve" && (
            <>
              {loading && <>Sending approval...</>}
              {!loading && !actionSuccess && <>Failed to send approval.</>}
              {!loading && actionSuccess && <>Order approved.</>}
            </>
          )}
          {actionRequest === "deny" && <>Deny form</>}
          <div
            className={styles["order-view-container"]}
            style={{ display: actionRequest === null ? undefined : "none" }}
          >
            <WooOrderView
              orderId={serverData.orderId}
              shippingMethods={serverData.shippingMethods.map(
                (method) => method.name
              )}
              storeUrl={serverData.storeUrl}
              permissions={{
                shipping: {
                  method: serverData.allowApproveChangeMethod
                    ? "edit"
                    : "hidden",
                },
              }}
              special={{
                allowUpsShippingToCanada: serverData.allowUpsToCanada,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
