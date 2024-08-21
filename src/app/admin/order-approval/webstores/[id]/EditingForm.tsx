"use client";

import { createWebstore } from "@/actions/orderWorkflow/create";
import { updateWebstore } from "@/actions/orderWorkflow/update";
import { useToast } from "@/components/ToastProvider";
import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UnwrapPromise } from "@/types/schema/misc";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

type Props = {
  existingWebstore: UnwrapPromise<ReturnType<typeof getWebstoreWithIncludes>>;
  shippingMethods: {
    id: number;
    name: string;
    serviceCode: number | null;
  }[];
};
export function EditingForm({ existingWebstore, shippingMethods }: Props) {
  const toast = useToast();
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    if (existingWebstore) await updateWebstore(formData);
    else await createWebstore(formData);

    toast.changesSaved();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
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
    </form>
  );
}
