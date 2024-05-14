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
  return (
    <form action="">
      <div>
        <img
          src={existingDesign?.image?.url}
          alt="design image"
          style={{
            width: "300px",
            height: "300px",
            backgroundColor: `#${existingDesign?.defaultBackgroundColor.hexCode}`,
          }}
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
      <select name="status" id="status">
        <option value="published">Published</option>
        <option value="published">Draft</option>
      </select>
      <h4>Categories</h4>
      {categories.map((cat) => (
        <div key={cat.id}>
          <h5>{cat.name}</h5>
          {cat.designSubcategories.map((sub) => (
            <div key={sub.id}>
              <input type="checkbox" name="subcategories" id={`${sub.id}`} />
              <label htmlFor={`${sub.id}`}>{sub.name}</label>
            </div>
          ))}
        </div>
      ))}
      <h4>Design Type</h4>
      <select name="design-type" id="design-type">
        {designTypes.map((type) => (
          <option key={type.id}>{type.name}</option>
        ))}
      </select>
      <h4>Tags</h4>
      <ul>
        {existingDesign &&
          existingDesign.designTags.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
      </ul>
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
    </form>
  );
}
