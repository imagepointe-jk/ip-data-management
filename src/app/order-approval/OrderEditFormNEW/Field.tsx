import { HTMLInputTypeAttribute } from "react";
import styles from "@/styles/orderApproval/new/orderEditForm/fieldsSection.module.css";

export type FieldType = {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute | "select" | "textarea";
  editable?: boolean;
  defaultValue?: string;
  options?: {
    label: string;
    value: string;
  }[];
};
type Props = {
  field: FieldType;
};
export function Field({ field }: Props) {
  const { label, type, defaultValue, options, editable } = field;

  return (
    <div className={styles["field-container"]}>
      <div className={styles["field-label"]}>{label}</div>

      {type === "text" && (
        <input
          type="text"
          defaultValue={defaultValue}
          disabled={editable === false}
        />
      )}

      {type === "textarea" && (
        <textarea cols={40} rows={5} disabled={editable === false}></textarea>
      )}

      {type === "select" && (
        <select disabled={editable === false}>
          {options &&
            options.map((option) => (
              <option key={option.value}>{option.label}</option>
            ))}
        </select>
      )}
    </div>
  );
}
