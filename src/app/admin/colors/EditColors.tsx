"use client";

import { Color } from "@prisma/client";
import styles from "@/styles/colorManagement/colors.module.css";
import { ColorCard } from "./ColorCard";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { useState } from "react";
import { useImmer } from "use-immer";
import { useToast } from "@/components/ToastProvider";
import { updateColors } from "@/actions/colors/update";

type Props = {
  colors: Color[];
};
export function EditColors({ colors: initialColors }: Props) {
  const [colors, setColors] = useImmer(initialColors);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function onClickDisplayInLibrary(id: number) {
    setColors((draft) => {
      const color = draft.find((c) => c.id === id);
      if (color) color.displayInDesignLibrary = !color.displayInDesignLibrary;
    });
  }

  async function onClickSave() {
    setLoading(true);
    try {
      await updateColors(colors);
      toast.changesSaved();
    } catch (error) {
      console.error(error);
      toast.toast("Error saving colors.", "error");
    }
    setLoading(false);
  }

  return (
    <>
      <div className={styles["cards-container"]}>
        {colors.map((color) => (
          <ColorCard
            key={color.id}
            color={color}
            onClickDisplayInLibrary={onClickDisplayInLibrary}
          />
        ))}
      </div>
      <div className={styles["floating-buttons-container"]}>
        <ButtonWithLoading
          className={styles["save-button"]}
          loading={loading}
          normalText="Save Changes"
          onClick={onClickSave}
        />
      </div>
    </>
  );
}
