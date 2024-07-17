import { getAccessCodeWithIncludes, getUser } from "@/db/access/orderApproval";
import { getOrder } from "@/fetch/woocommerce";
import { decryptWebstoreData } from "@/order-approval/encryption";
import { parseWooCommerceOrderJson } from "@/types/validations";
import Link from "next/link";

type Props = {
  params: {
    accessCode: string;
  };
};
export default async function Page({ params }: Props) {
  const accessCode = await getAccessCodeWithIncludes(params.accessCode);

  if (!accessCode) return <ErrorMessage />;

  const { key, secret } = decryptWebstoreData(
    accessCode.workflowInstance.parentWorkflow.webstore
  );

  try {
    const orderResponse = await getOrder(
      accessCode.workflowInstance.wooCommerceOrderId,
      accessCode.workflowInstance.parentWorkflow.webstore.url,
      key,
      secret
    );
    if (!orderResponse.ok) throw new Error();
    const json = await orderResponse.json();
    const parsed = parseWooCommerceOrderJson(json);

    return (
      <>
        <h1>
          Hello {accessCode.user.name}, you are the {accessCode.userRole} of
          this order with {parsed.lineItems.length} line items.
        </h1>
        <ul>
          <li>Status: {accessCode.workflowInstance.status}</li>
          {parsed.lineItems.map((lineItem, i) => (
            <li key={i}>
              {lineItem.name} x{lineItem.quantity} (${lineItem.total})
            </li>
          ))}
        </ul>
        <div>
          <Link href={`${accessCode.guid}/approve`}>Approve</Link>
          {"  "}
          <Link href={`${accessCode.guid}/deny`}>Deny</Link>
        </div>
      </>
    );
  } catch (error) {
    console.error(
      `A user tried to use access code ${accessCode.guid}, but something went wrong getting the WooCommerce order.`,
      error
    );
    return <ErrorMessage />;
  }
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
