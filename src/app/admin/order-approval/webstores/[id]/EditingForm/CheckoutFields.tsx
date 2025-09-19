import { createWebstoreCheckoutField } from "@/actions/orderWorkflow/create";
import { deleteCheckoutField } from "@/actions/orderWorkflow/delete";
import GenericTable from "@/components/GenericTable";
import { Updater } from "use-immer";
import styles from "@/styles/orderApproval/webstoreEditForm.module.css";
import { WebstoreEditorData } from "@/types/dto/orderApproval";

const checkoutFieldTypes = [
  {
    name: "text",
    displayName: "Text",
  },
  {
    name: "select",
    displayName: "Select",
  },
  {
    name: "textarea",
    displayName: "Text Area",
  },
];

type Props = {
  webstoreState: WebstoreEditorData;
  setWebstoreState: Updater<WebstoreEditorData>;
};
export function CheckoutFields({ webstoreState, setWebstoreState }: Props) {
  const sortedCheckoutFields = [...webstoreState.checkoutFields];
  sortedCheckoutFields.sort((a, b) => b.order - a.order);

  async function onClickAddCheckoutField() {
    const newField = await createWebstoreCheckoutField(webstoreState.id);
    setWebstoreState((draft) => {
      draft.checkoutFields.push(newField);
    });
  }

  async function onClickDeleteCheckoutField(id: number) {
    if (!confirm("Are you sure you want to delete this checkout field?"))
      return;

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

  function onChangeCheckoutFieldEditable(id: number, val: boolean) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.userCanEdit = val;
    });
  }

  function onChangeCheckoutFieldOrder(id: number, val: number) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.order = val;
    });
  }

  function onChangeCheckoutFieldStyle(id: number, val: string) {
    setWebstoreState((draft) => {
      const field = draft.checkoutFields.find((field) => field.id === id);
      if (field) field.style = val;
    });
  }

  return (
    <>
      <h2>Checkout Fields</h2>
      <GenericTable
        dataset={sortedCheckoutFields}
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
            headerName: "Editable",
            createCell: (data) => (
              <input
                type="checkbox"
                checked={data.userCanEdit}
                onChange={(e) =>
                  onChangeCheckoutFieldEditable(data.id, e.target.checked)
                }
              />
            ),
          },
          {
            headerName: "Sorting",
            createCell: (data) => (
              <input
                type="number"
                value={data.order}
                onChange={(e) =>
                  onChangeCheckoutFieldOrder(data.id, +e.target.value)
                }
              />
            ),
          },
          {
            headerName: "Style",
            createCell: (data) => (
              <select
                value={data.style || ""}
                onChange={(e) =>
                  onChangeCheckoutFieldStyle(data.id, e.target.value)
                }
              >
                <option value=""></option>
                <option value="emph">Emphasized</option>
              </select>
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
