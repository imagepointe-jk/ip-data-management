"use client";

import { getDesignCategoryHierarchy } from "@/db/access/designs";
import { UnwrapPromise } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

type Props = {
  categories: UnwrapPromise<ReturnType<typeof getDesignCategoryHierarchy>>;
};
export default function Filter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChangeCategory(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "none") newSearchParams.delete("subcategory");
    else newSearchParams.set("subcategory", encodeURIComponent(value));

    router.push(`designs?${newSearchParams}`);
  }

  function onChangeStatus(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "none") newSearchParams.delete("status");
    else newSearchParams.set("status", value);

    router.push(`designs?${newSearchParams}`);
  }

  function onChangeFeaturedOnly(e: ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;

    const newSearchParams = new URLSearchParams(searchParams);
    if (checked) newSearchParams.set("featuredOnly", "true");
    else newSearchParams.delete("featuredOnly");

    router.push(`designs?${newSearchParams}`);
  }

  return (
    <div>
      <select onChange={onChangeCategory}>
        <option value="none">Any Category</option>
        {categories.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            {cat.designSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <select onChange={onChangeStatus}>
        <option value="none">Any Status</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </select>
      <label htmlFor="featured">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          onChange={onChangeFeaturedOnly}
        />
        Featured Only
      </label>
    </div>
  );
}
