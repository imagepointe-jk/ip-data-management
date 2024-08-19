import styles from "@/styles/LoadingSpinner.module.css";

type Props = {
  className?: string;
};
export function LoadingIndicator({ className }: Props) {
  return (
    <img
      src="/spinner1.png"
      alt="spinner"
      className={`${styles["spinner-anim"]} ${className || styles["spinner"]}`}
    />
  );
}
