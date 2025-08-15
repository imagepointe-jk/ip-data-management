import { HTMLInputTypeAttribute } from "react";
import styles from "@/styles/orderApproval/new/orderEditForm/fieldsSection.module.css";

export type FieldType = {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute | "select" | "textarea";
  editable?: boolean;
  value?: string;
  options?: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
};
type Props = {
  field: FieldType;
};
export function Field({ field }: Props) {
  const { label, type, value, options, editable, onChange } = field;

  return (
    <div className={styles["field-container"]}>
      <div className={styles["field-label"]}>{label}</div>

      {type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={editable === false}
        />
      )}

      {type === "textarea" && (
        <textarea
          cols={40}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={editable === false}
        ></textarea>
      )}

      {type === "select" && (
        <select
          disabled={editable === false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option></option>
          {options &&
            options.map((option) => (
              <option key={option.value}>{option.label}</option>
            ))}
        </select>
      )}
    </div>
  );
}
