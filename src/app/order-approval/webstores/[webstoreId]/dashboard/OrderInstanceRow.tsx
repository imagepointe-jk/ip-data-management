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
  const [expandedOnce, setExpandedOnce] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [waitingOnUser, setWaitingOnUser] = useState<WaitingOnUser>();
  const dashboardViewerAccessCode = instance.accessCodes.find(
    (code) =>
      code.user.email.toLocaleLowerCase() ===
      webstore.approverDashboardViewerEmail.toLocaleLowerCase()
  )?.guid;
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
          "No access code found belonging to a user with the specified dashboard-viewing email"
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
      setStatusText("Workflow error.");
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

  async function resolveStatus() {
    try {
      const step = steps.find((step) => step.order === instance.currentStep);
      if (!step)
        throw new Error(
          `Step with order value ${instance.currentStep} not found`
        );

      const firstProceedListener = step.proceedListeners[0];
      if (!firstProceedListener) {
        //this should almost never appear since the user is unlikely to access the dashboard while a non-waiting step is executing
        setStatusText("Executing step (check back later)");
        return;
      }

      //if an explicit email address, look for the user's name in the webstore roles
      if (firstProceedListener.from !== "approver") {
        const userWithEmail = findUserInRoles(firstProceedListener.from);
        setWaitingOnUser(userWithEmail);
        setStatusText(`Waiting on ${userWithEmail?.name || "USER_NOT_FOUND"}`);
        return;
      }

      if (!order) {
        //if we get here, we need to fetch the order to display the approver name.
        //start the fetch process; we'll come back once the order is retrieved.
        getOrderData();
        return;
      }

      //if the "from" value is "approver", pull the email address from the WooCommerce order, THEN find the name in the webstore roles
      const approverEmail = order.metaData.find(
        (meta) => meta.key === "approver"
      )?.value;
      const userWithEmail = findUserInRoles(`${approverEmail}`);
      setWaitingOnUser(userWithEmail);
      setStatusText(`Waiting on ${userWithEmail?.name || "USER_NOT_FOUND"}`);
    } catch (error) {
      console.error(error);
      setStatusText("Workflow error.");
    }
  }

  useEffect(() => {
    resolveStatus();
  }, [order]);

  useEffect(() => {
    if (expandedOnce || !expanded) return;
    setExpandedOnce(true);
    getOrderData();
  }, [expanded, expandedOnce]);

  return (
    <div
      className={`${styles["fake-table-row-container"]} ${
        expanded ? styles["expanded"] : ""
      }`}
    >
      <div className={styles["fake-table-row-main"]}>
        <div className={styles["column-1"]}>{instance.wooCommerceOrderId}</div>
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
