"use client";

import { updateDesign } from "@/actions/designs/update";
import { useToast } from "@/components/ToastProvider";
import styles from "@/styles/designs/DesignPage.module.css";
import { useImmer } from "use-immer";
import { MainSection } from "./MainSection";
import { SecondarySection } from "./SecondarySection";
import { useState } from "react";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { CategoryDTO, ColorDTO, DesignDTO } from "@/types/dto/designs";

type DesignDataFormProps = {
  existingDesign: DesignDTO;
  designTypes: { id: number; name: string }[];
  colors: ColorDTO[];
  categories: CategoryDTO[];
  tags: { id: number; name: string }[];
};
export function DesignEditForm({
  existingDesign,
  colors,
  designTypes,
  categories,
  tags,
}: DesignDataFormProps) {
  const [design, setDesign] = useImmer(existingDesign);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onClickSave() {
    setLoading(true);
    try {
      await updateDesign(design);
      toast.changesSaved();
    } catch (error) {
      console.error(error);
      toast.toast("Error saving changes.", "error");
    }
    setLoading(false);
  }

  return (
    <>
      <div className={styles["main-flex"]}>
        <MainSection design={design} setDesign={setDesign} colors={colors} />
        <SecondarySection
          design={design}
          setDesign={setDesign}
          designTypes={designTypes}
          categories={categories}
          tags={tags}
          colors={colors}
        />
      </div>

      <ButtonWithLoading
        style={{ width: "150px" }}
        loading={loading}
        onClick={onClickSave}
      >
        Save Changes
      </ButtonWithLoading>
    </>
  );
}
