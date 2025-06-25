import styles from "@/styles/iframe-components/subcomponents/dots.module.css";
import { CSSProperties, Fragment } from "react";

type Props = {
  total: number;
  activeIndex: number;
  className?: string;
  style?: CSSProperties;
  dotClassNameActive?: string;
  dotClassNameInactive?: string;
};
export function Dots({
  activeIndex,
  total,
  className,
  style,
  dotClassNameInactive,
  dotClassNameActive,
}: Props) {
  return (
    <div className={`${styles["main"]} ${className || ""}`} style={style}>
      {Array.from({ length: total }, (_) => 0).map((_, i) => (
        <Fragment key={i}>
          {i === activeIndex && (
            <div
              className={`${styles["dot"]} ${styles["active"]} ${
                dotClassNameActive || ""
              }`}
            ></div>
          )}
          {i !== activeIndex && (
            <div
              className={`${styles["dot"]} ${dotClassNameInactive || ""}`}
            ></div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
