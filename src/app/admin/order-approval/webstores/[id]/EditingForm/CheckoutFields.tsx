import { createWebstoreCheckoutField } from "@/actions/orderWorkflow/create";
import { deleteCheckoutField } from "@/actions/orderWorkflow/delete";
import GenericTable from "@/components/GenericTable";
import { checkoutFieldTypes } from "@/order-approval/checkoutFields";
import { WebstoreEditorData } from "@/types/schema/orderApproval";
import { Updater } from "use-immer";
import styles from "@/styles/orderApproval/webstoreEditForm.module.css";

type Props = {
  webstoreState: WebstoreEditorData;
  setWebstoreState: Updater<WebstoreEditorData>;
};
export function CheckoutFields({ webstoreState, setWebstoreState }: Props) {
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
  );
}
