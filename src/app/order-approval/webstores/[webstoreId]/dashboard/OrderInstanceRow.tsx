"use client";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import styles from "@/styles/orderApproval/approverDashboard.module.css";
import { WooCommerceOrder } from "@/types/schema/woocommerce";

import {
  OrderWorkflowAccessCode,
  OrderWorkflowInstance,
  OrderWorkflowStep,
  OrderWorkflowStepProceedListener,
  OrderWorkflowUser,
  Webstore,
  WebstoreCheckoutField,
  WebstoreUserRole,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { OrderInstanceDetails } from "./OrderInstanceDetails";
import { getOrderApprovalOrder } from "@/fetch/client/woocommerce";
import { parseWooCommerceOrderJson } from "@/types/validations/woo";
import { IframeLink } from "@/components/IframeHelper/IframeLink";

type WaitingOnUser = {
  name: string;
  email: string;
};
type Props = {
  steps: (OrderWorkflowStep & {
    proceedListeners: OrderWorkflowStepProceedListener[];
  })[];
  instance: OrderWorkflowInstance & {
    accessCodes: (OrderWorkflowAccessCode & { user: OrderWorkflowUser })[];
  };
  checkoutFields: WebstoreCheckoutField[];
  webstore: Webstore;
  roles: (WebstoreUserRole & { users: OrderWorkflowUser[] })[];
};
export function OrderInstanceRow({
  instance,
  checkoutFields,
  steps,
  webstore,
  roles,
}: Props) {
  const [order, setOrder] = useState<WooCommerceOrder | null>(null);
  const [expanded, setExpanded] = useState(false);
  const dashboardViewerAccessCode = instance.accessCodes.find(
    (code) =>
      code.user.email.toLocaleLowerCase() ===
      webstore.approverDashboardViewerEmail.toLocaleLowerCase()
  )?.guid;
  const { statusText, waitingOnUser } = resolveStatusData();
  const waitingOnDashboardViewer =
    waitingOnUser &&
    waitingOnUser.email.toLocaleLowerCase() ===
      webstore.approverDashboardViewerEmail.toLocaleLowerCase();

  async function getOrderData() {
    try {
      const accessCodeWithViewerEmail = instance.accessCodes.find(
        (code) =>
          code.user.email.toLocaleLowerCase() ===
          webstore.approverDashboardViewerEmail.toLocaleLowerCase()
      );
      if (!accessCodeWithViewerEmail)
        throw new Error(
          `Error getting order data for order ID ${instance.wooCommerceOrderId}: No access code found belonging to a user with the specified dashboard-viewing email '${webstore.approverDashboardViewerEmail}'`
        );

      const orderResponse = await getOrderApprovalOrder(
        accessCodeWithViewerEmail.guid
      );
      if (!orderResponse.ok)
        throw new Error(
          `Response status ${orderResponse.status} when fetching order`
        );
      const json = await orderResponse.json();
      const parsed = parseWooCommerceOrderJson(json);
      setOrder(parsed);
    } catch (error) {
      console.error(error);
    }
  }

  function findUserInRoles(email: string) {
    const roleWithEmail = roles.find(
      (role) =>
        !!role.users.find(
          (user) => user.email.toLocaleLowerCase() === email.toLocaleLowerCase()
        )
    );
    return roleWithEmail?.users.find(
      (user) => user.email.toLocaleLowerCase() === email.toLocaleLowerCase()
    );
  }

  function resolveStatusData(): {
    statusText: string;
    waitingOnUser?: WaitingOnUser;
  } {
    try {
      if (order === null) return { statusText: "" };

      if (instance.status === "finished") {
        if (instance.approvedByUserEmail !== null)
          return { statusText: "Approved" };
        else return { statusText: "Denied" };
      }

      const step = steps.find((step) => step.order === instance.currentStep);
      if (!step)
        throw new Error(
          `Step with ordering value ${instance.currentStep} not found`
        );

      const firstProceedListener = step.proceedListeners[0];
      if (!firstProceedListener) {
        //this should almost never appear since the user is unlikely to access the dashboard while a non-waiting step is executing
        return { statusText: "Executing step (check back later)" };
      }

      //if the from value is not "approver", we assume it's an explicit email address; use the email to look for the user in the webstore roles
      if (firstProceedListener.from !== "approver") {
        const userWithEmail = findUserInRoles(firstProceedListener.from);
        return {
          statusText: `Waiting on ${userWithEmail?.name || "USER_NOT_FOUND"}`,
          waitingOnUser: userWithEmail,
        };
      }

      //if we get here, the from value is "approver". pull the approver's email address from the WooCommerce order, THEN find the name in the webstore roles
      const approverEmail = order.metaData.find(
        (meta) => meta.key === "approver"
      )?.value;
      const userWithEmail = findUserInRoles(`${approverEmail}`);
      return {
        statusText: `Waiting on ${userWithEmail?.name || "USER_NOT_FOUND"}`,
        waitingOnUser: userWithEmail,
      };
    } catch (error) {
      console.error(error);
      return { statusText: "Workflow error." };
    }
  }

  useEffect(() => {
    getOrderData();
  }, []);

  return (
    <div
      className={`${styles["fake-table-row-container"]} ${
        expanded ? styles["expanded"] : ""
      }`}
    >
      <div className={styles["fake-table-row-main"]}>
        <div className={styles["column-1"]}>
          {order === null && (
            <LoadingIndicator className={styles["status-loading-indicator"]} />
          )}
          {order !== null && <>{order.number}</>}
        </div>
        <div className={styles["column-2"]}>
          {instance.createdAt.toLocaleString()}
        </div>
        <div className={styles["column-3"]}>
          {!statusText && (
            <LoadingIndicator className={styles["status-loading-indicator"]} />
          )}
          {statusText}
        </div>
        <div className={styles["column-4"]}>
          {waitingOnUser && (
            <>
              {!waitingOnDashboardViewer && (
                <button onClick={() => setExpanded(!expanded)}>
                  {expanded ? "Hide" : "View"}
                </button>
              )}
              {waitingOnDashboardViewer && (
                <IframeLink
                  href={`${webstore.url}/order-approval?code=${dashboardViewerAccessCode}`}
                >
                  Edit
                </IframeLink>
              )}
            </>
          )}
        </div>
      </div>
      {order === null && (
        <div className={styles["order-details-loading-container"]}>
          <LoadingIndicator />
        </div>
      )}
      {order !== null && (
        <OrderInstanceDetails
          order={order}
          instance={instance}
          checkoutFields={checkoutFields}
        />
      )}
    </div>
  );
}
