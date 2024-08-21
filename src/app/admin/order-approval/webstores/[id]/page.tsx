import { createWebstore, updateWebstore } from "@/actions/orderWorkflow";
import {
  getShippingMethods,
  getWebstoreWithIncludes,
} from "@/db/access/orderApproval";
import Link from "next/link";
import { EditingForm } from "./EditingForm";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params }: Props) {
  const existingWebstore = await getWebstoreWithIncludes(+params.id);

  if (!existingWebstore && params.id !== "0")
    return <h1>Webstore {params.id} not found.</h1>;

  if (existingWebstore && !existingWebstore.shippingSettings)
    return <h1>Webstore shipping settings not found.</h1>;

  const shippingMethods = await getShippingMethods();

  return (
    <>
      <h1>
        {existingWebstore ? "Editing Webstore Data" : "Creating Webstore Data"}
      </h1>
      {existingWebstore && <Link href={`${params.id}/users`}>View Users</Link>}
      {/* <form action={existingWebstore ? updateWebstore : createWebstore}>
        <h2>
          Name{" "}
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={existingWebstore?.name}
            required
          />
        </h2>
        <div>
          Organization Name{" "}
          <input
            type="text"
            name="org-name"
            id="org-name"
            defaultValue={existingWebstore?.organizationName}
            required
          />
        </div>
        <div>
          URL{" "}
          <input
            type="text"
            name="url"
            id="url"
            defaultValue={existingWebstore?.url}
            required
          />
        </div>
        <div>
          {existingWebstore ? "Change API Key " : "Set API Key "}{" "}
          <input
            type="text"
            name="api-key"
            id="api-key"
            required={!existingWebstore}
          />
        </div>
        <div>
          {existingWebstore ? "Change API Secret " : "Set API Secret "}
          <input
            type="text"
            name="api-secret"
            id="api-secret"
            required={!existingWebstore}
          />
        </div>
        <input type="hidden" name="id" value={existingWebstore?.id} readOnly />
        <h2>Shipping Options</h2>
        <div>
          <label htmlFor="allow-approver-change-method">
            <input
              type="checkbox"
              name="allow-approver-change-method"
              id="allow-approver-change-method"
              defaultChecked={
                existingWebstore?.shippingSettings?.allowApproverChangeMethod
              }
            />
            Allow approver to change method
          </label>
        </div>
        <div>
          <label htmlFor="allow-ups-to-canada">
            <input
              type="checkbox"
              name="allow-ups-to-canada"
              id="allow-ups-to-canada"
              defaultChecked={
                existingWebstore?.shippingSettings?.allowUpsToCanada
              }
            />
            Allow UPS Shipping to Canada
          </label>
        </div>
        <h3>Shipping Methods</h3>
        {shippingMethods.map((method) => (
          <div key={method.id}>
            <label htmlFor={method.name}>
              <input
                type="checkbox"
                name="shipping-methods"
                id={method.name}
                value={method.id}
                defaultChecked={
                  !!existingWebstore?.shippingMethods.find(
                    (thisMethod) => thisMethod.id === method.id
                  )
                }
              />
              {method.name}
            </label>
          </div>
        ))}
        <button type="submit">
          {existingWebstore ? "Save Changes" : "Create Webstore"}
        </button>
      </form> */}
      <EditingForm
        existingWebstore={existingWebstore}
        shippingMethods={shippingMethods}
      />
    </>
  );
}
