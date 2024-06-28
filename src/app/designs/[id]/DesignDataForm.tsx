import { createDesign, updateDesign } from "@/actions/designs";
import { DesignCategoryWithIncludes, DesignWithIncludes } from "@/types/types";
import { convertDateToDefaultInputValue } from "@/utility/misc";
import { Color, DesignTag, DesignType } from "@prisma/client";
import styles from "@/styles/designs/DesignPage.module.css";
import { DesignVariations } from "./DesignVariations";

export type DesignDataFormProps = {
  existingDesign: DesignWithIncludes | null;
  designTypes: DesignType[];
  colors: Color[];
  categories: DesignCategoryWithIncludes[];
  tags: DesignTag[];
};
export default function DesignDataForm({
  existingDesign,
  designTypes,
  colors,
  categories,
  tags,
}: DesignDataFormProps) {
  return (
    <form action={existingDesign ? updateDesign : createDesign}>
      <div className={styles["main-flex"]}>
        <MainSection
          categories={categories}
          colors={colors}
          designTypes={designTypes}
          existingDesign={existingDesign}
          tags={tags}
        />
        <SecondarySection
          categories={categories}
          colors={colors}
          designTypes={designTypes}
          existingDesign={existingDesign}
          tags={tags}
        />
      </div>

      <input
        type="hidden"
        name="existingDesignId"
        value={existingDesign ? `${existingDesign.id}` : undefined}
      />
      <button type="submit">
        {existingDesign ? "Save Changes" : "Create Design"}
      </button>
    </form>
  );
}

function MainSection({ colors, existingDesign }: DesignDataFormProps) {
  return (
    <div className={styles["main-section"]}>
      {/* Head section */}

      <h1>
        Design{" "}
        <input
          type="text"
          name="design-number"
          id="design-number"
          defaultValue={existingDesign ? existingDesign.designNumber : ""}
          required={!existingDesign}
          className={styles["design-number"]}
        />
      </h1>
      <div>
        Database ID: {existingDesign ? existingDesign.id : "(not created)"}
      </div>

      {/* Image section */}

      <div>
        <div
          style={{
            border: "1px solid black",
            width: "300px",
            height: "300px",
          }}
        >
          {existingDesign && (
            <img
              src={existingDesign.imageUrl}
              alt="design image"
              style={{
                height: "100%",
                backgroundColor: `#${existingDesign?.defaultBackgroundColor.hexCode}`,
              }}
            />
          )}
        </div>
        <input
          type="text"
          name="image-url"
          id="image-url"
          defaultValue={existingDesign ? existingDesign.imageUrl : ""}
          placeholder="Image URL"
          size={34}
        />
      </div>

      {/* Background color section */}

      <div>
        <h4>Default Background Color</h4>
        <select
          name="bg-color"
          id="bg-color"
          defaultValue={
            existingDesign
              ? existingDesign.defaultBackgroundColor.id
              : undefined
          }
        >
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description section */}

      <div>
        <h4>Description</h4>
        <textarea
          name="description"
          id="description"
          defaultValue={existingDesign ? existingDesign.description || "" : ""}
          cols={40}
          rows={10}
        ></textarea>
      </div>
    </div>
  );
}

function SecondarySection({
  categories,
  designTypes,
  existingDesign,
  tags,
  colors,
}: DesignDataFormProps) {
  const selectedSubcategoryIds = existingDesign
    ? existingDesign.designSubcategories.map((cat) => cat.id)
    : [];
  const selectedTagIds = existingDesign
    ? existingDesign.designTags.map((tag) => tag.id)
    : [];

  return (
    <div className={styles["secondary-section"]}>
      {/* Design type section */}

      <div>
        <h4>Design Type</h4>
        <select
          name="design-type"
          id="design-type"
          defaultValue={
            existingDesign
              ? existingDesign.designType.id
              : designTypes[0]
              ? designTypes[0].id
              : 1
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
          defaultChecked={existingDesign ? existingDesign.featured : false}
          className={styles["featured-checkbox"]}
        />
      </div>

      {/* Status section */}

      <div>
        <h4>Status</h4>
        <select
          name="status"
          id="status"
          defaultValue={existingDesign ? existingDesign.status : "Draft"}
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
          defaultValue={
            existingDesign
              ? convertDateToDefaultInputValue(existingDesign.date)
              : undefined
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
          defaultValue={existingDesign?.priority}
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
                    name="subcategories"
                    id={`subcategory-${sub.id}`}
                    value={sub.id}
                    defaultChecked={selectedSubcategoryIds.includes(sub.id)}
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
                name="tags"
                id={`tag-${tag.id}`}
                value={`${tag.id}`}
                defaultChecked={selectedTagIds.includes(tag.id)}
              />
              <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Variations section */}

      {existingDesign && (
        <div>
          <DesignVariations
            existingDesign={existingDesign}
            categories={categories}
            colors={colors}
            designTypes={designTypes}
            tags={tags}
          />
        </div>
      )}
    </div>
  );
}
