import styles from "@/styles/orderImport/orderImport.module.css";

type Props = {
  value: string | undefined;
};
export function ValidatedData({ value }: Props) {
  if (value !== undefined) return <span>{value}</span>;

  return (
    <span
      className={`${styles["validation-notice"]} ${styles["data-missing"]}`}
    >
      missing
    </span>
  );
}
