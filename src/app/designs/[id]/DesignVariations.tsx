"use client";

import { DesignVariationWithIncludes } from "@/types/types";
import { DesignDataFormProps } from "./DesignDataForm";
import styles from "@/styles/designs/DesignPage.module.css";
import { createDesignVariation } from "@/actions/designs";
import { useRouter } from "next/navigation";

export function DesignVariations({ existingDesign }: DesignDataFormProps) {
  const router = useRouter();

  async function onClickAddVariation() {
    if (!existingDesign) return;

    await createDesignVariation(existingDesign.id);

    router.refresh();
  }

  return (
    <div>
      <h4>Variations</h4>
      <div className={styles["variations-container"]}>
        {(!existingDesign || existingDesign.variations.length === 0) &&
          "No varaitions"}
        {existingDesign &&
          existingDesign.variations.map((variation) => (
            <VariationCard key={variation.id} variation={variation} />
          ))}
        <div className={styles["add-variation-container"]}>
          <button
            type="button"
            onClick={onClickAddVariation}
            className={styles["add-variation-button"]}
          >
            <div>+</div>
          </button>
        </div>
      </div>
    </div>
  );
}

type VariationCardProps = {
  variation: DesignVariationWithIncludes;
};
function VariationCard({ variation }: VariationCardProps) {
  return (
    <div className={styles["variation-card"]}>
      <img
        src={variation.imageUrl}
        style={{ backgroundColor: `#${variation.color.hexCode}` }}
      />
      Color: {variation.color.name}
    </div>
  );
}
