"use client";

import { DesignDataFormProps } from "./DesignDataForm";
import styles from "@/styles/designs/DesignPage.module.css";

import { useRouter } from "next/navigation";
import { Color, DesignTag } from "@prisma/client";
import { ChangeEvent, useState } from "react";
import {
  DesignCategoryWithIncludes,
  DesignVariationWithIncludes,
} from "@/types/schema/designs";
import { createDesignVariation } from "@/actions/designs/create";
import { deleteDesignVariation } from "@/actions/designs/delete";

export function DesignVariations({
  existingDesign,
  colors,
  categories,
  tags,
}: DesignDataFormProps) {
  const [viewedVariation, setViewedVariation] = useState(0);
  const router = useRouter();
  const sorted = existingDesign ? [...existingDesign.variations] : [];
  //ensures that the variations always appear in a stable order (the specific order doesn't matter)
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

  function onClickScroll(direction: "left" | "right") {
    if (direction === "left" && viewedVariation > 0)
      setViewedVariation(viewedVariation - 1);
    if (direction === "right" && viewedVariation < sorted.length - 1)
      setViewedVariation(viewedVariation + 1);
  }

  return (
    <div>
      <div className={styles["variations-heading-container"]}>
        <h4>
          Variations{" "}
          {sorted.length > 0
            ? `(viewing ${viewedVariation + 1} of ${sorted.length})`
            : "(none yet)"}
        </h4>
        <button
          type="button"
          className={styles["variations-scroll-button"]}
          onClick={() => onClickScroll("left")}
          disabled={viewedVariation < 1}
        >
          &lt;
        </button>
        <button
          type="button"
          className={styles["variations-scroll-button"]}
          onClick={() => onClickScroll("right")}
          disabled={viewedVariation > sorted.length - 2}
        >
          &gt;
        </button>
        <button
          type="button"
          className={styles["variations-add"]}
          onClick={onClickAddVariation}
        >
          + Add New
        </button>
      </div>
      <div className={styles["variations-container"]}>
        {existingDesign &&
          sorted.map((variation, i) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              colors={colors}
              categories={categories}
              tags={tags}
              viewing={viewedVariation === i}
              onClickDelete={onClickDeleteVariation}
            />
          ))}
      </div>
    </div>
  );
}

type VariationCardProps = {
  variation: DesignVariationWithIncludes;
  colors: Color[];
  categories: DesignCategoryWithIncludes[];
  tags: DesignTag[];
  viewing: boolean;
  onClickDelete: (id: number) => void;
};
function VariationCard({
  variation,
  onClickDelete,
  colors,
  categories,
  tags,
  viewing,
}: VariationCardProps) {
  const selectedSubcategoryIds = variation.designSubcategories.map(
    (cat) => cat.id
  );
  const selectedTagIds = variation.designTags.map((tag) => tag.id);
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
    <div
      className={styles["variation-card"]}
      style={{ display: viewing ? "flex" : "none" }}
    >
      <div>
        <div className={styles["variation-image-container"]}>
          <img
            src={imageUrl}
            style={{
              backgroundColor: `#${
                bgColorToShow ? bgColorToShow.hexCode : "ffffff"
              }`,
            }}
          />
        </div>
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
      </div>
      <div>
        <div className={styles["variation-scroll-boxes"]}>
          <div>
            <h4>Categories</h4>
            <div className={styles["variation-scroll-box"]}>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <h5>{cat.name}</h5>
                  {cat.designSubcategories.map((sub) => (
                    <div key={sub.id}>
                      <input
                        type="checkbox"
                        name={`subcategories-variation-${variation.id}`}
                        id={`subcategory-${sub.id}-variation-${variation.id}`}
                        value={sub.id}
                        defaultChecked={selectedSubcategoryIds.includes(sub.id)}
                      />
                      <label
                        htmlFor={`subcategory-${sub.id}-variation-${variation.id}`}
                      >
                        {sub.name}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div>
              <h4>Tags</h4>
              <div className={styles["variation-scroll-box"]}>
                {tags.map((tag) => (
                  <div key={tag.id}>
                    <input
                      type="checkbox"
                      name={`tags-variation-${variation.id}`}
                      id={`tag-${tag.id}-variation-${variation.id}`}
                      value={`${tag.id}`}
                      defaultChecked={selectedTagIds.includes(tag.id)}
                    />
                    <label htmlFor={`tag-${tag.id}-variation-${variation.id}`}>
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={`button-danger ${styles["variation-delete"]}`}
          onClick={() => onClickDelete(variation.id)}
        >
          Delete Variation
        </button>
      </div>
    </div>
  );
}
