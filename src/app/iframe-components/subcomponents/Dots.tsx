import styles from "@/styles/iframe-components/subcomponents/dots.module.css";
import { CSSProperties } from "react";

type Props = {
  total: number;
  activeIndex: number;
  className?: string;
  style?: CSSProperties;
};
export function Dots({ activeIndex, total, className, style }: Props) {
  return (
    <div className={`${styles["main"]} ${className || ""}`} style={style}>
      {Array.from({ length: total }, (_) => 0).map((_, i) => (
        <div
          key={i}
          className={`${styles["dot"]} ${
            i === activeIndex ? styles["active"] : ""
          }`}
        ></div>
      ))}
    </div>
  );
}
