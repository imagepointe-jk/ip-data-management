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
import { Color } from "@prisma/client";
import { ChangeEvent, useState } from "react";

export function DesignVariations({
  existingDesign,
  colors,
}: DesignDataFormProps) {
  const router = useRouter();
  const sorted = existingDesign ? [...existingDesign.variations] : [];
  sorted.sort((a, b) => a.id - b.id);

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
          sorted.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              colors={colors}
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
  colors: Color[];
  onClickDelete: (id: number) => void;
};
function VariationCard({
  variation,
  onClickDelete,
  colors,
}: VariationCardProps) {
  const [bgColorId, setBgColorId] = useState(variation.color.id);
  const [imageUrl, setImageUrl] = useState(variation.imageUrl);

  function onChangeColor(e: ChangeEvent<HTMLSelectElement>) {
    setBgColorId(+e.target.value);
  }

  function onChangeImageUrl(e: ChangeEvent<HTMLInputElement>) {
    setImageUrl(e.target.value);
  }

  const bgColorToShow = colors.find((color) => color.id === bgColorId);

  return (
    <div className={styles["variation-card"]}>
      <img
        src={imageUrl}
        style={{
          backgroundColor: `#${
            bgColorToShow ? bgColorToShow.hexCode : "ffffff"
          }`,
        }}
      />
      <div>
        <h4>Image URL</h4>
        <input
          type="text"
          name={`image-url-variation-${variation.id}`}
          id={`image-url-variation-${variation.id}`}
          onChange={onChangeImageUrl}
          value={imageUrl}
        />
      </div>
      <h4>Default Background Color</h4>
      <select
        name={`bg-color-variation-${variation.id}`}
        id={`bg-color-variation-${variation.id}`}
        value={bgColorId}
        onChange={onChangeColor}
      >
        {colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.name}
          </option>
        ))}
      </select>
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
