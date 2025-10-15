import { HTMLInputTypeAttribute } from "react";
import styles from "@/styles/orderApproval/approverArea/orderEditForm/fieldsSection.module.css";
import stylesMain from "@/styles/orderApproval/approverArea/orderEditForm/main.module.css";

export type FieldType = {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute | "select" | "textarea";
  editable?: boolean;
  value?: string;
  style?: "emph";
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
  const { label, type, value, options, editable, style, onChange } = field;

  return (
    <div
      className={
        style === "emph" ? styles["checkout-field-emphasized"] : undefined
      }
    >
      <label className={styles["field-label"]}>{label}</label>

      {type === "text" && (
        <input
          type="text"
          className={stylesMain["field"]}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={editable === false}
        />
      )}

      {type === "textarea" && (
        <textarea
          cols={40}
          rows={5}
          className={stylesMain["field"]}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={editable === false}
        ></textarea>
      )}

      {type === "select" && (
        <select
          className={stylesMain["field"]}
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
