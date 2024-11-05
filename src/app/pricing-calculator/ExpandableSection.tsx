import { ReactNode, useState } from "react";
import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

type Props = {
  children: ReactNode;
  label: string;
};
export function ExpandableSection({ children, label }: Props) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        className={styles["expandable-toggle"]}
        onClick={() => setExpanded(!expanded)}
      >
        + {label}
      </div>
      <div style={{ display: expanded ? "block" : "none" }}>{children}</div>
    </div>
  );
}
