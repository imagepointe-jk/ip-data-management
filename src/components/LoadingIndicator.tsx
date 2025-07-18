import styles from "@/styles/LoadingSpinner.module.css";
import { CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
};
export function LoadingIndicator({ className, style }: Props) {
  return (
    <img
      src="/spinner1.png"
      alt="spinner"
      className={`${styles["spinner-anim"]} ${styles["spinner"]} ${
        className || ""
      }`}
      style={style}
    />
  );
}
