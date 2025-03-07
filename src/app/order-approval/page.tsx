"use client";

import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { OrderEditForm } from "@/app/order-approval/OrderEditForm/OrderEditForm";
import { validateOrderApprovalServerData } from "@/types/validations/orderApproval";
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
import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";

export default function Page() {
  return (
    <IframeHelperProvider>
      <Main />
    </IframeHelperProvider>
  );
}

function Main() {
  const [serverData, setServerData] = useState(
    null as OrderApprovalServerData | null
  );
  const [accessCode, setAccessCode] = useState("");
  const { parentWindow, loading: iframeLoading } = useIframe();
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionAttempted, setActionAttempted] = useState(false);
  const search = new URLSearchParams(parentWindow.location?.search);
  const accessCodeInParams = search.get("code")
    ? `${search.get("code")}`
    : null;
  const action = search.get("action") ? `${search.get("action")}` : null;

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

  async function getServerData(accessCode: string) {
    try {
      const dataResponse = await getOrderApprovalServerData(accessCode);
      const dataJson = await dataResponse.json();
      const dataFromServer = validateOrderApprovalServerData(dataJson);

      setServerData(dataFromServer);
      if (action !== "approve") setLoading(false); //if "approve", we'll be immediately sending an async approval, so we will stay in the loading state for a bit longer
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessCodeInParams === null) return;

    setAccessCode(accessCodeInParams);
    getServerData(accessCodeInParams);
  }, [accessCodeInParams]);

  useEffect(() => {
    if (action === "approve" && accessCode !== "") doApprove();
  }, [action, accessCode]);

  return (
    <>
      {(loading || iframeLoading) && (
        <div className={styles["status-message"]}>Loading...</div>
      )}
      {!serverData && !loading && !iframeLoading && <>Error.</>}
      {serverData && (
        <div className={styles["main"]}>
          {action === "approve" && (
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
          {action === "deny" && (
            <DenyForm
              loading={loading}
              onClickSubmit={doDeny}
              success={actionSuccess}
              error={actionAttempted && !loading && !actionSuccess}
            />
          )}
          {action === null && (
            <div className={styles["order-view-container"]}>
              <OrderEditForm
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
                userEmail={serverData.userEmail}
                showNavButtons={!actionSuccess && !actionAttempted} //Only show the buttons if an action hasn't been attempted yet
                checkoutFields={serverData.checkoutFields}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
