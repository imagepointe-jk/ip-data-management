// "use client";

import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
// import { OrderEditForm } from "@/app/order-approval/OrderEditForm/OrderEditForm";
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
import ApproveForm from "./ApproveForm";
import { NextSearchParams } from "@/types/schema/misc";
import { prisma } from "@/prisma";
import { getOrder, getProductsMultiple } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { OrderEditForm } from "./OrderEditFormNEW/OrderEditForm";
// import { Main } from "./Main";

type Props = {
  searchParams: NextSearchParams;
};
export default async function Page({ searchParams }: Props) {
  const search = await searchParams;
  const code = search.code;
  if (!code || !(typeof code === "string"))
    return <>Error: No access code provided.</>;

  const foundAccessCode = await prisma.orderWorkflowAccessCode.findFirst({
    where: {
      guid: code,
    },
    include: {
      workflowInstance: {
        include: {
          parentWorkflow: {
            include: {
              webstore: {
                include: {
                  shippingMethods: true,
                  shippingSettings: true,
                  checkoutFields: true,
                },
              },
              steps: {
                include: {
                  proceedListeners: true,
                },
              },
            },
          },
          approvedByUser: true,
          deniedByUser: true,
        },
      },
      user: true,
    },
  });

  if (!foundAccessCode) return <>Error: Access code not found.</>;

  const webstore = foundAccessCode.workflowInstance.parentWorkflow.webstore;
  const orderId = foundAccessCode.workflowInstance.wooCommerceOrderId;
  const { key, secret } = decryptWebstoreData(webstore);
  const order = await getOrder(orderId, webstore.url, key, secret);
  if (!order.ok) return <>Error: Unable to retrieve order id {orderId}.</>;

  const json = await order.json();
  const parsed = parseWooCommerceOrderJson(json);
  const products = await getProductsMultiple(
    parsed.lineItems.map((item) => item.productId),
    webstore.url,
    key,
    secret
  );

  return <OrderEditForm order={parsed} />;
  // return (
  //   <IframeHelperProvider>
  //     <Main />
  //   </IframeHelperProvider>
  // );
}

// function Main() {
//   const [serverData, setServerData] = useState(
//     null as OrderApprovalServerData | null
//   );
//   const [accessCode, setAccessCode] = useState("");
//   const { parentWindow, loading: iframeLoading } = useIframe();
//   const [loading, setLoading] = useState(true);
//   const [actionSuccess, setActionSuccess] = useState(false);
//   const [actionAttempted, setActionAttempted] = useState(false);
//   const search = new URLSearchParams(parentWindow.location?.search);
//   const accessCodeInParams = search.get("code")
//     ? `${search.get("code")}`
//     : null;
//   const action = search.get("action") ? `${search.get("action")}` : null;
//   const instanceFinishedStatus = serverData?.approvedByUserName
//     ? "approved"
//     : serverData?.deniedByUserName
//     ? "denied"
//     : "INVALID_STATUS";
//   const waitingOnThisUser = serverData?.waitingOnUserEmails.find(
//     (email) =>
//       email.toLocaleLowerCase() === serverData.userEmail.toLocaleLowerCase()
//   );

//   async function doApprove(comments: string | null, pin: string) {
//     try {
//       setLoading(true);
//       setActionAttempted(true);
//       await receiveWorkflowEvent(accessCode, "approve", comments, pin);
//       setActionSuccess(true);
//     } catch (error) {
//       console.error(error);
//     }
//     setLoading(false);
//   }

//   async function doDeny(reason: string, pin: string) {
//     try {
//       setLoading(true);
//       setActionAttempted(true);
//       await receiveWorkflowEvent(accessCode, "deny", reason, pin);
//       setActionSuccess(true);
//     } catch (error) {
//       console.error(error);
//     }
//     setLoading(false);
//   }

//   async function getOrder() {
//     const orderResponse = await getOrderApprovalOrder(accessCode);
//     const orderJson = await orderResponse.json();
//     return parseWooCommerceOrderJson(orderJson);
//   }

//   async function getProducts(ids: number[]) {
//     const responses = await Promise.all(
//       ids.map(async (id) => {
//         try {
//           const response = await getOrderApprovalProduct(id, accessCode);
//           if (!response.ok)
//             throw new Error(
//               `Status ${response.status} while getting product id ${id}`
//             );
//           const json = await response.json();
//           return parseWooCommerceProduct(json);
//         } catch (error) {
//           console.error(error);
//           return null;
//         }
//       })
//     );
//     const nonNull: WooCommerceProduct[] = [];
//     for (const r of responses) {
//       if (r !== null) nonNull.push(r);
//     }
//     return nonNull;
//   }

//   async function onSubmitHelpForm(data: FormData) {
//     data.append("code", accessCode);
//     await receiveOrderHelpForm(data);
//   }

//   async function getServerData(accessCode: string) {
//     try {
//       const dataResponse = await getOrderApprovalServerData(accessCode);
//       const dataJson = await dataResponse.json();
//       const dataFromServer = validateOrderApprovalServerData(dataJson);

//       setServerData(dataFromServer);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     if (accessCodeInParams === null) return;

//     setAccessCode(accessCodeInParams);
//     getServerData(accessCodeInParams);
//   }, [accessCodeInParams]);

//   if (serverData && !waitingOnThisUser) {
//     return (
//       <div style={{ textAlign: "center", fontSize: "1.25rem" }}>
//         Order {serverData?.orderId} does not require any action from you at this
//         time.
//       </div>
//     );
//   }

//   return (
//     <>
//       {(loading || iframeLoading) && (
//         <div className={styles["status-message"]}>Loading...</div>
//       )}
//       {!serverData && !loading && !iframeLoading && (
//         <>Error: Unable to load approval interface.</>
//       )}
//       {serverData && (
//         <div className={styles["main"]}>
//           {action === "approve" && (
//             <ApproveForm
//               loading={loading}
//               error={actionAttempted && !loading && !actionSuccess}
//               success={actionSuccess}
//               showPIN={serverData.requirePinForApproval}
//               doApprove={doApprove}
//             />
//           )}
//           {action === "deny" && (
//             <DenyForm
//               loading={loading}
//               onClickSubmit={doDeny}
//               success={actionSuccess}
//               showPIN={serverData.requirePinForApproval}
//               error={actionAttempted && !loading && !actionSuccess}
//             />
//           )}
//           {action === null && (
//             <div className={styles["order-view-container"]}>
//               <OrderEditForm
//                 orderId={serverData.orderId}
//                 shippingMethods={serverData.shippingMethods.map(
//                   (method) => method.name
//                 )}
//                 getOrder={getOrder}
//                 getProducts={getProducts}
//                 onSubmitHelpForm={onSubmitHelpForm}
//                 storeUrl={serverData.storeUrl}
//                 permissions={{
//                   shipping: {
//                     method: serverData.allowApproverChangeMethod
//                       ? "edit"
//                       : "hidden",
//                   },
//                 }}
//                 special={{
//                   allowUpsShippingToCanada: serverData.allowUpsToCanada,
//                   showOrderHelpButton: serverData.allowOrderHelpRequest,
//                 }}
//                 userEmail={serverData.userEmail}
//                 showNavButtons={!actionSuccess && !actionAttempted} //Only show the buttons if an action hasn't been attempted yet
//                 checkoutFields={serverData.checkoutFields}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </>
//   );
// }
