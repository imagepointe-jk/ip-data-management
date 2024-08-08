"use client";

import {
  getOrderApprovalIframeData,
  receiveWorkflowEvent,
} from "@/actions/orderWorkflow";
import { WooOrderView } from "@/components/WooOrderView";
import { UnwrapPromise } from "@/types/types";
import { validateOrderApprovalIframeData } from "@/types/validations/orderApproval";
import { useEffect, useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import DenyForm from "./DenyForm";

type Action = "approve" | "deny" | null;
export default function Page() {
  const [serverData, setServerData] = useState(
    null as UnwrapPromise<ReturnType<typeof getOrderApprovalIframeData>> | null
  );
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionRequest, setActionRequest] = useState(null as Action);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionAttempted, setActionAttempted] = useState(false);

  async function onReceiveParentWindowInfo(e: any) {
    try {
      const parsed = validateOrderApprovalIframeData(e.data);
      const searchParams = new URLSearchParams(parsed.searchParams);
      const accessCodeInParams = `${searchParams.get("code")}`;
      setAccessCode(accessCodeInParams);
      const dataFromServer = await getOrderApprovalIframeData(
        accessCodeInParams
      );

      const action = searchParams.get("action");
      setActionRequest(action as Action | null);
      if (action !== "approve") setLoading(false); //if "approve", we'll be immediately sending an async approval, so we will stay in the loading state for a bit longer
      setServerData(dataFromServer);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  async function doApprove() {
    try {
      setLoading(true);
      setActionAttempted(true);
      await receiveWorkflowEvent(accessCode, "approve");
      setActionSuccess(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function doDeny(reason: string) {
    try {
      setLoading(true);
      setActionAttempted(true);
      await receiveWorkflowEvent(accessCode, "deny", reason);
      setActionSuccess(true);
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
    if (actionRequest === "approve") doApprove();
  }, [actionRequest]);

  return (
    <>
      {loading && <div className={styles["status-message"]}>Loading...</div>}
      {!serverData && !loading && <>Error.</>}
      {serverData && (
        <div className={styles["main"]}>
          {/* Only show the buttons if an action hasn't been attempted yet */}
          {!actionSuccess && !actionAttempted && (
            <div className={styles["nav-buttons-container"]}>
              <button
                className={styles["nav-button-review"]}
                onClick={() => setActionRequest(null)}
              >
                Review
              </button>
              <button
                className={styles["nav-button-approve"]}
                onClick={() => setActionRequest("approve")}
              >
                Approve Now
              </button>
              <button
                className={styles["nav-button-deny"]}
                onClick={() => setActionRequest("deny")}
              >
                Deny
              </button>
            </div>
          )}
          {actionRequest === "approve" && (
            <>
              {/* {loading && <>Sending approval...</>} */}
              {!loading && !actionSuccess && (
                <div className={styles["status-message"]}>
                  Failed to send approval.
                </div>
              )}
              {!loading && actionSuccess && (
                <div className={styles["status-message"]}>
                  Order approved. ✅
                </div>
              )}
            </>
          )}
          {actionRequest === "deny" && (
            <DenyForm
              loading={loading}
              onClickSubmit={doDeny}
              success={actionSuccess}
              error={actionAttempted && !loading && !actionSuccess}
            />
          )}
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