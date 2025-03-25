import styles from "@/styles/designs/DesignPage.module.css";
import {
  DesignCategoryWithIncludes,
  DesignVariationWithIncludes,
  DesignWithIncludes,
} from "@/types/schema/designs";
import { Color, DesignTag } from "@prisma/client";
import { ChangeEvent } from "react";
import { Updater } from "use-immer";

export const VARIATION_CARD_WIDTH = 610;
type Props = {
  variation: DesignVariationWithIncludes;
  setDesign: Updater<DesignWithIncludes>;
  colors: Color[];
  categories: DesignCategoryWithIncludes[];
  tags: DesignTag[];
  onClickDelete: (id: number) => void;
};
export function DesignVariationCard({
  variation,
  setDesign,
  onClickDelete,
  colors,
  categories,
  tags,
}: Props) {
  const selectedSubcategoryIds = variation.designSubcategories.map(
    (cat) => cat.id
  );
  const selectedTagIds = variation.designTags.map((tag) => tag.id);

  function onChangeColor(e: ChangeEvent<HTMLSelectElement>) {
    const id = +e.target.value;
    const colorMatch = colors.find((color) => color.id === id);
    if (!colorMatch) return;

    setDesign((draft) => {
      const variationInDraft = draft.variations.find(
        (varInDraft) => varInDraft.id === variation.id
      );
      if (!variationInDraft) return;

      variationInDraft.colorId = id;
      variationInDraft.color = colorMatch;
    });
  }

  function onChangeImageUrl(e: ChangeEvent<HTMLInputElement>) {
    setDesign((draft) => {
      const variationInDraft = draft.variations.find(
        (varInDraft) => varInDraft.id === variation.id
      );
      if (!variationInDraft) return;

      variationInDraft.imageUrl = e.target.value;
    });
  }

  function onClickSubcategory(id: number) {
    const categoryMatch = categories.find(
      (cat) => !!cat.designSubcategories.find((sub) => sub.id === id)
    );
    if (!categoryMatch) return;

    const subcategoryMatch = categoryMatch.designSubcategories.find(
      (sub) => sub.id === id
    );
    if (!subcategoryMatch) return;

    setDesign((draft) => {
      const variationInDraft = draft.variations.find(
        (varInDraft) => varInDraft.id === variation.id
      );
      if (!variationInDraft) return;

      const variationHasSubcategory =
        !!variationInDraft.designSubcategories.find((sub) => sub.id === id);
      if (variationHasSubcategory) {
        variationInDraft.designSubcategories =
          variationInDraft.designSubcategories.filter((sub) => sub.id !== id);
      } else {
        variationInDraft.designSubcategories.push(subcategoryMatch);
      }
    });
  }

  function onClickTag(id: number) {
    const tagMatch = tags.find((tag) => tag.id === id);
    if (!tagMatch) return;

    setDesign((draft) => {
      const variationInDraft = draft.variations.find(
        (varInDraft) => varInDraft.id === variation.id
      );
      if (!variationInDraft) return;

      const variationHasTag = !!variationInDraft.designTags.find(
        (tag) => tag.id === id
      );
      if (variationHasTag) {
        variationInDraft.designTags = variationInDraft.designTags.filter(
          (tag) => tag.id !== id
        );
      } else {
        variationInDraft.designTags.push(tagMatch);
      }
    });
  }

  const bgColorToShow = colors.find((color) => color.id === variation.colorId);

  return (
    <div
      className={styles["variation-card"]}
      style={{ width: `${VARIATION_CARD_WIDTH}px` }}
    >
      <div>
        <div className={styles["variation-image-container"]}>
          <img
            src={variation.imageUrl}
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
            value={variation.imageUrl}
          />
        </div>
        <h4>Default Background Color</h4>
        <select
          name={`bg-color-variation-${variation.id}`}
          id={`bg-color-variation-${variation.id}`}
          value={variation.colorId}
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
                        id={`subcategory-${sub.id}-variation-${variation.id}`}
                        checked={selectedSubcategoryIds.includes(sub.id)}
                        onChange={() => onClickSubcategory(sub.id)}
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
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => onClickTag(tag.id)}
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
