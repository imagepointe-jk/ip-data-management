import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { Updater } from "use-immer";

type Props = {
  webstoreState: WebstoreEditorData;
  setWebstoreState: Updater<WebstoreEditorData>;
  shippingMethods: {
    id: number;
    name: string;
    serviceCode: number | null;
  }[];
};
export function ShippingSettings({
  webstoreState,
  setWebstoreState,
  shippingMethods,
}: Props) {
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
  return (
    <>
      <h2>Shipping Options</h2>
      {/* <div>
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
      </div> */}
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
            {/* correctly render escaped characters present in the method names */}
            <span dangerouslySetInnerHTML={{ __html: method.name }}></span>
          </label>
        </div>
      ))}
    </>
  );
}
