import { ReactNode, useState } from "react";
import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

type Props = {
  children: ReactNode;
  label: string;
  isExpanded?: boolean;
  onClickExpand?: () => void;
};
export function ExpandableSection({
  children,
  label,
  isExpanded,
  onClickExpand,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const expandedStateToUse = isExpanded !== undefined ? isExpanded : expanded;

  return (
    <div>
      <div
        className={styles["expandable-toggle"]}
        onClick={onClickExpand ? onClickExpand : () => setExpanded(!expanded)}
      >
        {expandedStateToUse ? "-" : "+"} {label}
      </div>
      <div style={{ display: expandedStateToUse ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
}
