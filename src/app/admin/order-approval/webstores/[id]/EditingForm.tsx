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
      <div className="vert-flex-group">
        <div>
          <h2 style={{ marginBottom: 0 }}>Name</h2>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={existingWebstore?.name}
            required
            className="input-major"
          />
        </div>
        <div>
          <label className="input-label">Organization Name</label>
          <input
            type="text"
            name="org-name"
            id="org-name"
            defaultValue={existingWebstore?.organizationName}
            required
          />
        </div>
        <div>
          <label className="input-label">URL</label>
          <input
            type="text"
            name="url"
            id="url"
            defaultValue={existingWebstore?.url}
            required
          />
        </div>
        <div>
          <label className="input-label">Sales Person Name</label>
          <input
            type="text"
            name="sales-person-name"
            id="sales-person-name"
            defaultValue={existingWebstore?.salesPersonName}
            required
          />
        </div>
        <div>
          <label className="input-label">Sales Person Email</label>
          <input
            type="email"
            name="sales-person-email"
            id="sales-person-email"
            defaultValue={existingWebstore?.salesPersonEmail}
            required
          />
        </div>
        <div>
          <label className="input-label">
            Other support emails (separate with {";"})
          </label>
          <input
            type="text"
            name="other-support-emails"
            id="other-support-emails"
            defaultValue={existingWebstore?.otherSupportEmails || undefined}
            style={{ width: "600px" }}
          />
        </div>
        <div>
          <label className="input-label">
            Order updated emails (separate with {";"})
          </label>
          <input
            type="text"
            name="order-updated-emails"
            id="order-updated-emails"
            defaultValue={existingWebstore?.orderUpdatedEmails || undefined}
            style={{ width: "600px" }}
          />
        </div>
        <div>
          <label className="input-label">
            {existingWebstore ? "Change API Key " : "Set API Key "}
          </label>
          <input
            type="text"
            name="api-key"
            id="api-key"
            required={!existingWebstore}
          />
        </div>
        <div>
          <label className="input-label">
            {existingWebstore ? "Change API Secret " : "Set API Secret "}
          </label>
          <input
            type="text"
            name="api-secret"
            id="api-secret"
            required={!existingWebstore}
          />
        </div>
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
