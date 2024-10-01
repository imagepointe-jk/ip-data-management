"use client";

import { createCategory, createSubcategory } from "@/actions/designs/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { DesignCategoryWithIncludes } from "@/types/schema/designs";
import { findAllFormValues } from "@/utility/misc";
import { DesignCategory, DesignType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  categories: DesignCategoryWithIncludes[];
  designTypes: DesignType[];
};
export function CategoryEditor({ categories, designTypes }: Props) {
  const [creatingId, setCreatingId] = useState(null as number | null); //the id of the category for which we're currently waiting for subcategory creation to finish, if any.
  const [creatingCategory, setCreatingCategory] = useState(false);
  const router = useRouter();

  async function onSubmitCreateCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = `${formData.get("name")}`;
    const designTypeId = +`${formData.get("design-type-id")}`;

    setCreatingCategory(true);
    await createCategory(name, designTypeId);
    setCreatingCategory(false);
    router.refresh();
  }

  async function onSubmitCreateSubcategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const nameField = findAllFormValues(formData, (fieldName) =>
      fieldName.startsWith("new-subcategory-")
    )[0];
    if (!nameField || !nameField.fieldValue) return;

    const categoryId = +`${nameField.fieldName.match(/\d+/g)}`;
    setCreatingId(categoryId);
    await createSubcategory(`${nameField.fieldValue}`, categoryId);
    setCreatingId(null);
    router.refresh();
  }

  return (
    <>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.name} ({cat.designType.name}){" "}
            {
              <ul>
                {cat.designSubcategories.map((sub) => (
                  <li key={sub.id}>{sub.name}</li>
                ))}
                <li>
                  <form onSubmit={onSubmitCreateSubcategory}>
                    <input
                      type="text"
                      name={`new-subcategory-${cat.id}`}
                      placeholder="New Subcategory"
                    />
                    <ButtonWithLoading
                      loading={creatingId === cat.id}
                      normalText="+ Add"
                    />
                  </form>
                </li>
              </ul>
            }
          </li>
        ))}
      </ul>
      <form
        onSubmit={onSubmitCreateCategory}
        className="content-frame"
        style={{ width: "500px" }}
      >
        <div>
          <label className="input-label">Create Category</label>
          <input type="text" name="name" />
        </div>
        <div>
          {designTypes.map((type, i) => (
            <div key={type.id}>
              <label htmlFor={`design-type-${type.id}`}>
                <input
                  type="radio"
                  name="design-type-id"
                  id={`design-type-${type.id}`}
                  value={type.id}
                  defaultChecked={i === 0}
                />
                {type.name}
              </label>
            </div>
          ))}
        </div>
        <div>
          <ButtonWithLoading loading={creatingCategory} normalText="+ Create" />
        </div>
      </form>
    </>
  );
}
