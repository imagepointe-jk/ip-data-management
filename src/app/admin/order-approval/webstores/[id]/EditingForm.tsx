"use client";

import {
  createWebstore,
  createWebstoreCheckoutField,
} from "@/actions/orderWorkflow/create";
import { updateWebstore } from "@/actions/orderWorkflow/update";
import GenericTable from "@/components/GenericTable";
import { useToast } from "@/components/ToastProvider";
import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { useImmer } from "use-immer";
import styles from "@/styles/orderApproval/webstoreEditForm.module.css";
import { deleteCheckoutField } from "@/actions/orderWorkflow/delete";
import { checkoutFieldTypes } from "@/order-approval/checkoutFields";

const blankState: WebstoreEditorData = {
  id: 0,
  name: "",
  customOrderApprovedEmail: "",
  orderUpdatedEmails: "",
  organizationName: "",
  otherSupportEmails: "",
  salesPersonEmail: "",
  salesPersonName: "",
  url: "",
  checkoutFields: [],
  shippingMethods: [],
  shippingSettings: null,
  useCustomOrderApprovedEmail: false,
};
type Props = {
  webstoreData: WebstoreEditorData | null;
  shippingMethods: {
    id: number;
    name: string;
    serviceCode: number | null;
  }[];
  shortcodeReference: ReactNode;
};
export function EditingForm({
  webstoreData,
  shippingMethods,
  shortcodeReference,
}: Props) {
  const [webstoreState, setWebstoreState] = useImmer(
    webstoreData ? webstoreData : blankState
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const toast = useToast();
  const router = useRouter();
  const creatingNew = webstoreState.id === 0;

  function onChangeAllowApproverChangeMethod(val: boolean) {
    setWebstoreState((draft) => {
      if (!draft.shippingSettings) {
        draft.shippingSettings = {
          allowApproverChangeMethod: val,
          allowUpsToCanada: false,
        };
      } else {
        draft.shippingSettings.allowApproverChangeMethod = val;
      }
    });
  }

  function onChangeAllowUpsToCanada(val: boolean) {
    setWebstoreState((draft) => {
      if (!draft.shippingSettings) {
        draft.shippingSettings = {
          allowUpsToCanada: val,
          allowApproverChangeMethod: false,
        };
      } else {
        draft.shippingSettings.allowUpsToCanada = val;
      }
    });
  }

  function onClickShippingMethod(id: number) {
    setWebstoreState((draft) => {
      const existing = draft.shippingMethods.find((method) => method.id === id);
      if (existing)
        draft.shippingMethods = draft.shippingMethods.filter(
          (method) => method.id !== id
        );
      else draft.shippingMethods.push({ id });
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!creatingNew) {
      await updateWebstore(webstoreState);
      toast.changesSaved();
    } else {
      const created = await createWebstore({
        ...webstoreState,
        apiKey,
        apiSecret,
      });
      toast.changesSaved();
      router.push(`${created.id}`);
    }
  }

  async function onClickAddCheckoutField() {
    const newField = await createWebstoreCheckoutField(webstoreState.id);
    setWebstoreState((draft) => {
      draft.checkoutFields.push(newField);
    });
  }

  async function onClickDeleteCheckoutField(id: number) {
    await deleteCheckoutField(id);
    setWebstoreState((draft) => {
      draft.checkoutFields = draft.checkoutFields.filter(
        (field) => field.id !== id
      );
    });
  }

  function onChangeCheckoutFieldName(id: number, val: string) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.name = val;
    });
  }

  function onChangeCheckoutFieldLabel(id: number, val: string) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.label = val;
    });
  }

  function onChangeCheckoutFieldType(id: number, val: string) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.type = val;
    });
  }

  function onChangeCheckoutFieldOptions(id: number, val: string) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.options = val;
    });
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
            required
            className="input-major"
            value={webstoreState.name}
            onChange={(e) =>
              setWebstoreState((draft) => {
                draft.name = e.target.value;
              })
            }
          />
        </div>
      </div>
      <div>
        <label className="input-label">Organization Name</label>
        <input
          type="text"
          name="org-name"
          id="org-name"
          value={webstoreState.organizationName}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.organizationName = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">URL</label>
        <input
          type="text"
          name="url"
          id="url"
          value={webstoreState.url}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.url = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Sales Person Name</label>
        <input
          type="text"
          name="sales-person-name"
          id="sales-person-name"
          value={webstoreState.salesPersonName}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.salesPersonName = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">Sales Person Email</label>
        <input
          type="email"
          name="sales-person-email"
          id="sales-person-email"
          value={webstoreState.salesPersonEmail}
          required
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.salesPersonEmail = e.target.value;
            })
          }
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
          value={webstoreState.otherSupportEmails || ""}
          style={{ width: "600px" }}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.otherSupportEmails = e.target.value;
            })
          }
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
          value={webstoreState.orderUpdatedEmails || ""}
          style={{ width: "600px" }}
          onChange={(e) =>
            setWebstoreState((draft) => {
              draft.orderUpdatedEmails = e.target.value;
            })
          }
        />
      </div>
      <div>
        <label className="input-label">
          {!creatingNew ? "Change API Key " : "Set API Key "}
        </label>
        <input
          type="text"
          name="api-key"
          id="api-key"
          required={creatingNew}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div>
        <label className="input-label">
          {!creatingNew ? "Change API Secret " : "Set API Secret "}
        </label>
        <input
          type="text"
          name="api-secret"
          id="api-secret"
          required={creatingNew}
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
      </div>

      {/* Custom email settings */}

      <div>
        <label
          htmlFor="use-custom-order-approved-email"
          className="input-label"
        >
          <input
            type="checkbox"
            name="use-custom-order-approved-email"
            id="use-custom-order-approved-email"
            checked={webstoreState.useCustomOrderApprovedEmail}
            onChange={(e) =>
              setWebstoreState((draft) => {
                draft.useCustomOrderApprovedEmail = e.target.checked;
              })
            }
          />
          Use custom &quot;order approved&quot; email
        </label>
      </div>
      {webstoreState.useCustomOrderApprovedEmail && (
        <>
          <div>
            <label
              htmlFor="custom-order-approved-email"
              className="input-label"
            >
              Custom &quot;order approved&quot; email
            </label>
            <textarea
              name="custom-order-approved-email"
              id="custom-order-approved-email"
              cols={60}
              rows={10}
              value={webstoreState.customOrderApprovedEmail || ""}
              onChange={(e) =>
                setWebstoreState((draft) => {
                  draft.customOrderApprovedEmail = e.target.value;
                })
              }
            ></textarea>
          </div>
          {shortcodeReference}
        </>
      )}

      {/* Checkout fields */}

      {!creatingNew && (
        <>
          <h2>Checkout Fields</h2>
          <GenericTable
            dataset={webstoreState.checkoutFields}
            columns={[
              {
                headerName: "Name",
                createCell: (data) => (
                  <input
                    type="text"
                    value={data.name}
                    placeholder="field_name"
                    onChange={(e) =>
                      onChangeCheckoutFieldName(data.id, e.target.value)
                    }
                  />
                ),
              },
              {
                headerName: "Label",
                createCell: (data) => (
                  <input
                    type="text"
                    value={data.label}
                    placeholder="Field Label"
                    onChange={(e) =>
                      onChangeCheckoutFieldLabel(data.id, e.target.value)
                    }
                  />
                ),
              },
              {
                headerName: "Type",
                createCell: (data) => (
                  <select
                    value={data.type}
                    onChange={(e) =>
                      onChangeCheckoutFieldType(data.id, e.target.value)
                    }
                  >
                    {checkoutFieldTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                headerName: "Options",
                createCell: (data) => (
                  <input
                    type="text"
                    value={data.options || ""}
                    onChange={(e) =>
                      onChangeCheckoutFieldOptions(data.id, e.target.value)
                    }
                    placeholder="option 1 | option 2 | option 3"
                    style={{
                      display: data.type !== "select" ? "none" : undefined,
                    }}
                  />
                ),
              },
              {
                headerName: "",
                createCell: (data) => (
                  <button
                    type="button"
                    onClick={() => onClickDeleteCheckoutField(data.id)}
                    className="button-danger button-small"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
            className={styles["checkout-fields-table"]}
          />
          {webstoreState.checkoutFields.length === 0 && (
            <div>(No checkout fields)</div>
          )}
          <div>
            <button onClick={onClickAddCheckoutField} type="button">
              + Add Checkout Field
            </button>
          </div>
        </>
      )}

      {/* Shipping settings */}

      <h2>Shipping Options</h2>
      <div>
        <label htmlFor="allow-approver-change-method">
          <input
            type="checkbox"
            name="allow-approver-change-method"
            id="allow-approver-change-method"
            checked={
              webstoreState.shippingSettings?.allowApproverChangeMethod || false
            }
            onChange={(e) =>
              onChangeAllowApproverChangeMethod(e.target.checked)
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
            checked={webstoreState.shippingSettings?.allowUpsToCanada || false}
            onChange={(e) => onChangeAllowUpsToCanada(e.target.checked)}
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
              checked={
                !!webstoreState.shippingMethods.find(
                  (thisMethod) => thisMethod.id === method.id
                )
              }
              onChange={() => onClickShippingMethod(method.id)}
            />
            {method.name}
          </label>
        </div>
      ))}

      <button type="submit">
        {!creatingNew ? "Save Changes" : "Create Webstore"}
      </button>
    </form>
  );
}
