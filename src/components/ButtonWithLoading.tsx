"use client";

import styles from "@/styles/ButtonWithLoading.module.css";
import { CSSProperties, ReactNode } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

type Props = {
  className?: string;
  style?: CSSProperties;
  spinnerClassName?: string;
  children?: ReactNode; //will be used instead of normal text if provided
  normalText?: string; //expected if no children provided
  loading: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};
export function ButtonWithLoading({
  className,
  style,
  children,
  normalText,
  spinnerClassName,
  loading,
  disabled,
  onClick,
  type,
}: Props) {
  return (
    <button
      className={`${styles["button"]} ${className || ""}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
      type={type}
    >
      {loading ? (
        <LoadingIndicator className={spinnerClassName || styles["spinner"]} />
      ) : (
        children || normalText || "Button"
      )}
    </button>
  );
}
