import { updateDesign } from "@/actions/designs";
import { DesignCategoryWithIncludes, DesignWithIncludes } from "@/types/types";
import { convertDateToDefaultInputValue } from "@/utility/misc";
import { Color, DesignTag, DesignType } from "@prisma/client";

type DesignDataFormProps = {
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
  const selectedSubcategoryIds = existingDesign
    ? existingDesign.designSubcategories.map((cat) => cat.id)
    : [];
  const selectedTagIds = existingDesign
    ? existingDesign.designTags.map((tag) => tag.id)
    : [];

  return (
    <form action={updateDesign}>
      <h1>
        Design{" "}
        <input
          type="text"
          name="design-number"
          id="design-number"
          defaultValue={existingDesign ? existingDesign.designNumber : ""}
        />
      </h1>
      <div>
        Database ID: {existingDesign ? existingDesign.id : "(not created)"}
      </div>
      <div
        style={{ border: "1px solid black", width: "300px", height: "300px" }}
      >
        {existingDesign && (
          <img
            src={existingDesign.imageUrl}
            alt="design image"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: `#${existingDesign?.defaultBackgroundColor.hexCode}`,
            }}
          />
        )}
        <input
          type="text"
          name="image-url"
          id="image-url"
          defaultValue={existingDesign ? existingDesign.imageUrl : ""}
          size={60}
        />
      </div>
      <h4>Description</h4>
      <textarea
        name="description"
        id="description"
        defaultValue={existingDesign ? existingDesign.description || "" : ""}
      ></textarea>
      <h4>Featured?</h4>
      <input
        type="checkbox"
        name="featured"
        id="featured"
        defaultChecked={existingDesign ? existingDesign.featured : false}
      />
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
      <h4>Status</h4>
      <select
        name="status"
        id="status"
        defaultValue={existingDesign ? existingDesign.status : "Draft"}
      >
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </select>
      <h4>Categories</h4>
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
      <h4>Design Type</h4>
      <select
        name="design-type"
        id="design-type"
        defaultValue={
          existingDesign ? existingDesign.designType.id : designTypes[0].id
        }
      >
        {designTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <h4>Tags</h4>
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
      <h4>Default Background Color</h4>
      <select
        name="bg-color"
        id="bg-color"
        defaultValue={
          existingDesign ? existingDesign.defaultBackgroundColor.id : undefined
        }
      >
        {colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.name}
          </option>
        ))}
      </select>
      <input
        type="hidden"
        name="existingDesignId"
        value={existingDesign ? `${existingDesign.id}` : undefined}
      />
      <button type="submit">Save Changes</button>
    </form>
  );
}
