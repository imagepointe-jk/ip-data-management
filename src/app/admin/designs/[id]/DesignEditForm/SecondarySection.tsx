import styles from "@/styles/designs/DesignPage.module.css";
import {
  DesignCategoryWithIncludes,
  DesignWithIncludes,
} from "@/types/schema/designs";
import { convertDateToDefaultInputValue } from "@/utility/misc";
import { DesignTag, DesignType } from "@prisma/client";
import { Updater } from "use-immer";

type Props = {
  design: DesignWithIncludes;
  setDesign: Updater<DesignWithIncludes>;
  designTypes: DesignType[];
  categories: DesignCategoryWithIncludes[];
  tags: DesignTag[];
};
export function SecondarySection({
  design,
  setDesign,
  designTypes,
  categories,
  tags,
}: Props) {
  const selectedSubcategoryIds = design.designSubcategories.map(
    (cat) => cat.id
  );
  const selectedTagIds = design.designTags.map((tag) => tag.id);

  function onClickSubcategory(subcategoryId: number) {
    const categoryMatch = categories.find((cat) =>
      cat.designSubcategories.find((sub) => sub.id === subcategoryId)
    );
    if (!categoryMatch) return;

    const subcategoryMatch = categoryMatch.designSubcategories.find(
      (sub) => sub.id === subcategoryId
    );
    if (!subcategoryMatch) return;

    setDesign((draft) => {
      const designHasGivenSubcategory = !!design.designSubcategories.find(
        (sub) => sub.id === subcategoryId
      );
      if (designHasGivenSubcategory) {
        draft.designSubcategories = draft.designSubcategories.filter(
          (sub) => sub.id !== subcategoryId
        );
      } else {
        draft.designSubcategories.push(subcategoryMatch);
      }
    });
  }

  function onClickTag(tagId: number) {
    const tagMatch = tags.find((tag) => tag.id === tagId);
    if (!tagMatch) return;

    setDesign((draft) => {
      const designHasTag = !!draft.designTags.find((tag) => tag.id === tagId);
      if (designHasTag) {
        draft.designTags = draft.designTags.filter((tag) => tag.id !== tagId);
      } else {
        draft.designTags.push(tagMatch);
      }
    });
  }

  return (
    <div className={styles["secondary-section"]}>
      {/* Design type section */}

      <div>
        <h4>Design Type</h4>
        <select
          name="design-type"
          id="design-type"
          value={design.designTypeId}
          onChange={(e) =>
            setDesign((draft) => {
              const designTypeMatch = designTypes.find(
                (type) => type.id === +e.target.value
              );
              if (!designTypeMatch) return;

              draft.designTypeId = designTypeMatch.id;
              draft.designType = designTypeMatch;
            })
          }
        >
          {designTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Featured section */}

      <div>
        <h4>Featured?</h4>
        <input
          type="checkbox"
          name="featured"
          id="featured"
          checked={design.featured}
          onChange={(e) =>
            setDesign((draft) => {
              draft.featured = e.target.checked;
            })
          }
          className={styles["featured-checkbox"]}
        />
      </div>

      {/* Status section */}

      <div>
        <h4>Status</h4>
        <select
          name="status"
          id="status"
          value={design.status}
          onChange={(e) =>
            setDesign((draft) => {
              draft.status = e.target.value;
            })
          }
        >
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Date section */}

      <div>
        <h4>Date</h4>
        <input
          type="date"
          name="date"
          id="date"
          value={convertDateToDefaultInputValue(design.date)}
          onChange={(e) =>
            setDesign((draft) => {
              draft.date = new Date(e.target.value);
            })
          }
        />
      </div>

      {/* Priority section */}

      <div>
        <h4>Priority</h4>
        <input
          type="number"
          name="priority"
          id="priority"
          value={design.priority}
          onChange={(e) =>
            setDesign((draft) => {
              draft.priority = +e.target.value;
            })
          }
        />
      </div>

      {/* Categories section */}

      <div>
        <h4>Categories</h4>
        <div className={styles["scroll-box"]}>
          {categories.map((cat) => (
            <div key={cat.id}>
              <h5>{cat.name}</h5>
              {cat.designSubcategories.map((sub) => (
                <div key={sub.id}>
                  <input
                    type="checkbox"
                    id={`subcategory-${sub.id}`}
                    checked={selectedSubcategoryIds.includes(sub.id)}
                    onChange={() => onClickSubcategory(sub.id)}
                  />
                  <label htmlFor={`subcategory-${sub.id}`}>{sub.name}</label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tags section */}

      <div>
        <h4>Tags</h4>
        <div className={styles["scroll-box"]}>
          {tags.map((tag) => (
            <div key={tag.id}>
              <input
                type="checkbox"
                id={`tag-${tag.id}`}
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => onClickTag(tag.id)}
              />
              <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
