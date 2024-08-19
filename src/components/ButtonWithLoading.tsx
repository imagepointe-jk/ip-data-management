"use client";

import styles from "@/styles/ButtonWithLoading.module.css";
import { ReactNode } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

type Props = {
  className?: string;
  spinnerClassName?: string;
  children?: ReactNode; //will be used instead of normal text if provided
  normalText?: string; //expected if no children provided
  loading: boolean;
  onClick?: () => void;
};
export function ButtonWithLoading({
  className,
  children,
  normalText,
  spinnerClassName,
  loading,
  onClick,
}: Props) {
  return (
    <button className={className} onClick={onClick}>
      {loading ? (
        <LoadingIndicator className={spinnerClassName || styles["spinner"]} />
      ) : (
        children || normalText || "Button"
      )}
    </button>
  );
}
