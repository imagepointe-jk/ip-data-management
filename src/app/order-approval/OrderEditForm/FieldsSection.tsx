import styles from "@/styles/orderApproval/approverArea/orderEditForm/fieldsSection.module.css";
import { Field, FieldType } from "./Field";

type Props = {
  heading: string;
  fields: FieldType[];
};
export function FieldsSection({ heading, fields }: Props) {
  return (
    <div>
      <h3 className={styles["heading"]}>{heading}</h3>
      <div className={styles["fields-flex"]}>
        {fields.map((field) => (
          <Field key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
}
