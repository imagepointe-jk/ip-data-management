"use client";

import { ChangeEvent, useState } from "react";
import styles from "@/styles/AsyncCheckbox.module.css";
import { LoadingIndicator } from "./LoadingIndicator";

type Props = {
  initialChecked: boolean;
  onChange: (checked: boolean) => Promise<unknown>;
};
export function AsyncCheckbox({ initialChecked, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(initialChecked);

  async function onChanged(e: ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setLoading(true);
    try {
      await onChange(checked);
      setChecked(checked);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <span className={styles["main"]}>
      <input
        type="checkbox"
        onChange={onChanged}
        checked={checked}
        disabled={loading}
      />
      {loading && <LoadingIndicator className={styles["spinner"]} />}
    </span>
  );
}
