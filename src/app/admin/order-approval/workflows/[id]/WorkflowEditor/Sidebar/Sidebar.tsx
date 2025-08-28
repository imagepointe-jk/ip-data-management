"use client";

import styles from "@/styles/orderApproval/admin/sidebar.module.css";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { WorkflowPreview } from "./WorkflowPreview";
import { StepEditor } from "./StepEditor/StepEditor";

export function Sidebar() {
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState<"edit step" | "preview">("edit step");

  return (
    <div className={`${styles["main"]} ${hidden ? styles["hidden"] : ""}`}>
      {tab === "preview" && <WorkflowPreview />}
      {tab === "edit step" && <StepEditor />}
      <div className={styles["tabs-container"]}>
        <button
          className={`${styles["tab"]} ${
            tab !== "edit step" ? styles["inactive"] : ""
          }`}
          onClick={() => setTab("edit step")}
        >
          Edit Step
        </button>
        <button
          className={`${styles["tab"]} ${
            tab !== "preview" ? styles["inactive"] : ""
          }`}
          onClick={() => setTab("preview")}
        >
          Workflow Preview
        </button>
      </div>
      <button
        className={styles["show-hide-button"]}
        onClick={() => setHidden(!hidden)}
      >
        <FontAwesomeIcon icon={hidden ? faChevronLeft : faChevronRight} />
      </button>
    </div>
  );
}
