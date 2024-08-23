//TODO: An IframeHelperProvider has been created to more easily get window data in an iframe context. If we need to continue using iframes for order approval, this should be refactored using the new helper.

"use client";

import { WooOrderView } from "@/components/WooOrderView/WooOrderView";
import {
  validateOrderApprovalIframeData,
  validateOrderApprovalServerData,
} from "@/types/validations/orderApproval";
import { useEffect, useState } from "react";
import styles from "@/styles/orderApproval/approverArea.module.css";
import DenyForm from "./DenyForm";
import {
  getOrderApprovalOrder,
  getOrderApprovalProduct,
  getOrderApprovalServerData,
} from "@/fetch/client/woocommerce";
import {
  parseWooCommerceOrderJson,
  parseWooCommerceProduct,
} from "@/types/validations/woo";
import { OrderApprovalServerData } from "@/types/schema/orderApproval";
import { WooCommerceProduct } from "@/types/schema/woocommerce";
import {
  receiveOrderHelpForm,
  receiveWorkflowEvent,
} from "@/actions/orderWorkflow/misc";

type Action = "approve" | "deny" | null;
export default function Page() {
  const [serverData, setServerData] = useState(
    null as OrderApprovalServerData | null
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
      const dataResponse = await getOrderApprovalServerData(accessCodeInParams);
      const dataJson = await dataResponse.json();
      const dataFromServer = validateOrderApprovalServerData(dataJson);

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

  async function getOrder() {
    const orderResponse = await getOrderApprovalOrder(accessCode);
    const orderJson = await orderResponse.json();
    return parseWooCommerceOrderJson(orderJson);
  }

  async function getProducts(ids: number[]) {
    const responses = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await getOrderApprovalProduct(id, accessCode);
          if (!response.ok)
            throw new Error(
              `Status ${response.status} while getting product id ${id}`
            );
          const json = await response.json();
          return parseWooCommerceProduct(json);
        } catch (error) {
          console.error(error);
          return null;
        }
      })
    );
    const nonNull: WooCommerceProduct[] = [];
    for (const r of responses) {
      if (r !== null) nonNull.push(r);
    }
    return nonNull;
  }

  async function onSubmitHelpForm(data: FormData) {
    data.append("code", accessCode);
    await receiveOrderHelpForm(data);
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
              getOrder={getOrder}
              getProducts={getProducts}
              onSubmitHelpForm={onSubmitHelpForm}
              storeUrl={serverData.storeUrl}
              permissions={{
                shipping: {
                  method: serverData.allowApproverChangeMethod
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
