import styles from "@/styles/designs/DesignPage.module.css";
import { convertDateToDefaultInputValue } from "@/utility/misc";
import { Updater } from "use-immer";
import { DesignVariations } from "./DesignVariations";
import { Categories } from "./Categories";
import { Tags } from "./Tags";
import { CategoryDTO, ColorDTO, DesignDTO } from "@/types/dto/designs";

type Props = {
  design: DesignDTO;
  setDesign: Updater<DesignDTO>;
  designTypes: { id: number; name: string }[];
  categories: CategoryDTO[];
  tags: { id: number; name: string }[];
  colors: ColorDTO[];
};
export function SecondarySection({
  design,
  setDesign,
  designTypes,
  categories,
  tags,
  colors,
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

      <Categories
        designTypeId={design.designTypeId}
        selectedSubcategoryIds={selectedSubcategoryIds}
        categories={categories}
        onClickSubcategory={onClickSubcategory}
      />

      {/* Tags section */}

      <Tags
        selectedTagIds={selectedTagIds}
        onClickTag={onClickTag}
        tags={tags}
      />

      {/* Variations section */}

      <div>
        <DesignVariations
          design={design}
          setDesign={setDesign}
          categories={categories}
          colors={colors}
          tags={tags}
        />
      </div>
    </div>
  );
}
