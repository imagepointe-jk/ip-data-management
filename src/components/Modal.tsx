"use client";

import { CSSProperties, ReactNode } from "react";
import styles from "@/styles/Modal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onClickClose: () => void;
  children: ReactNode;
  bgStyle?: CSSProperties;
  windowStyle?: CSSProperties;
  bgClassName?: string;
  windowClassName?: string;
  xButtonClassName?: string;
};
export function Modal({
  children,
  onClickClose,
  bgStyle,
  windowStyle,
  bgClassName,
  windowClassName,
  xButtonClassName,
}: Props) {
  return (
    <div
      className={bgClassName || styles["bg"]}
      onClick={onClickClose}
      style={bgStyle}
    >
      <div
        className={windowClassName || styles["window"]}
        style={windowStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className={xButtonClassName || styles["x"]}
          onClick={onClickClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
}
