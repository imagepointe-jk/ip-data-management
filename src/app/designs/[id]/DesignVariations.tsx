"use client";

import { DesignVariationWithIncludes } from "@/types/types";
import { DesignDataFormProps } from "./DesignDataForm";
import styles from "@/styles/designs/DesignPage.module.css";
import {
  createDesignVariation,
  deleteDesignVariation,
} from "@/actions/designs";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export function DesignVariations({ existingDesign }: DesignDataFormProps) {
  const router = useRouter();

  async function onClickAddVariation() {
    if (!existingDesign) return;

    await createDesignVariation(existingDesign.id);

    router.refresh();
  }

  async function onClickDeleteVariation(id: number) {
    await deleteDesignVariation(id);
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
            <VariationCard
              key={variation.id}
              variation={variation}
              onClickDelete={onClickDeleteVariation}
            />
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
  onClickDelete: (id: number) => void;
};
function VariationCard({ variation, onClickDelete }: VariationCardProps) {
  return (
    <div className={styles["variation-card"]}>
      <img
        src={variation.imageUrl}
        style={{ backgroundColor: `#${variation.color.hexCode}` }}
      />
      Color: {variation.color.name}
      <button
        type="button"
        className={styles["variation-x"]}
        onClick={() => onClickDelete(variation.id)}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}
