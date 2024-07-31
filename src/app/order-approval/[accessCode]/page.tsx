import { WooOrderView } from "@/components/WooOrderView";
import { getAccessCodeWithIncludes, getUser } from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import Link from "next/link";

type Props = {
  params: {
    accessCode: string;
  };
};
export default async function Page({ params }: Props) {
  const accessCode = await getAccessCodeWithIncludes(params.accessCode);

  if (!accessCode) return <ErrorMessage />;
  const {
    workflowInstance: {
      wooCommerceOrderId,
      parentWorkflow: { webstore },
    },
  } = accessCode;

  const { key, secret } = decryptWebstoreData(webstore);
  const {
    workflowInstance: {
      parentWorkflow: {
        webstore: { shippingMethods, shippingSettings },
      },
    },
  } = accessCode;

  return (
    <>
      <h1>Order {accessCode.workflowInstance.wooCommerceOrderId}</h1>
      <Link href={`${accessCode.guid}/approve`}>Approve</Link>{" "}
      <Link href={`${accessCode.guid}/deny`}>Deny</Link>
      <WooOrderView
        apiKey={key}
        apiSecret={secret}
        orderId={wooCommerceOrderId}
        storeUrl={webstore.url}
        permissions={{
          shipping: {
            method: shippingSettings?.allowApproverChangeMethod
              ? "edit"
              : "hidden",
          },
        }}
        special={{
          allowUpsShippingToCanada: shippingSettings?.allowUpsToCanada,
        }}
        shippingMethods={shippingMethods.map((method) => method.name)}
      />
    </>
  );
}

function ErrorMessage() {
  return (
    <>
      <h1>Something went wrong.</h1>
      <p>
        We were unable to find your order. Please contact us for assistance.
      </p>
    </>
  );
}
