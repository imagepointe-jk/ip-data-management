"use client";

import {
  DesignCategoryWithIncludes,
  DesignWithIncludes,
} from "@/types/schema/designs";
import { Color, DesignTag, DesignType } from "@prisma/client";
import styles from "@/styles/designs/DesignPage.module.css";
import { useImmer } from "use-immer";
import { MainSection } from "./MainSection";
import { SecondarySection } from "./SecondarySection";

type DesignDataFormProps = {
  existingDesign: DesignWithIncludes;
  designTypes: DesignType[];
  colors: Color[];
  categories: DesignCategoryWithIncludes[];
  tags: DesignTag[];
};
export function DesignEditForm({
  existingDesign,
  colors,
  designTypes,
  categories,
  tags,
}: DesignDataFormProps) {
  const [design, setDesign] = useImmer(existingDesign);

  async function onClickSave() {
    console.log("save");
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
        />
      </div>
      <button onClick={onClickSave}>Save Changes</button>
    </>
  );
}
