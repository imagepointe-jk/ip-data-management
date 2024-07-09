"use client";

import { getDesignCategoryHierarchy } from "@/db/access/designs";
import { UnwrapPromise } from "@/types/types";
import { getTimeStampYearsAgo } from "@/utility/misc";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

type Props = {
  categories: UnwrapPromise<ReturnType<typeof getDesignCategoryHierarchy>>;
};
export default function Filter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { age, designType, featuredOnly, status, subcategory } =
    getSearchValues();

  const categoriesToShow = categories.filter(
    (cat) =>
      (cat.designType.name === "Embroidery" && designType === "Embroidery") ||
      (designType !== "Embroidery" && cat.designType.name !== "Embroidery")
  );

  function onChangeCategory(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "none") newSearchParams.delete("subcategory");
    else {
      newSearchParams.set("subcategory", encodeURIComponent(value));
      newSearchParams.delete("pageNumber");
    }

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function onChangeStatus(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "none") newSearchParams.delete("status");
    else {
      newSearchParams.set("status", value);
      newSearchParams.delete("pageNumber");
    }

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function onChangeAge(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("before");
    newSearchParams.delete("after");
    if (value === "new") {
      newSearchParams.set("after", `${getTimeStampYearsAgo(2)}`);
      newSearchParams.delete("pageNumber");
    } else if (value === "old") {
      newSearchParams.set("before", `${getTimeStampYearsAgo(2)}`);
      newSearchParams.delete("pageNumber");
    }

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function onChangeFeaturedOnly(e: ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;

    const newSearchParams = new URLSearchParams(searchParams);
    if (checked) {
      newSearchParams.set("featuredOnly", "true");
      newSearchParams.delete("pageNumber");
    } else newSearchParams.delete("featuredOnly");

    router.push(`designs?${newSearchParams}`);
    router.refresh();
  }

  function getSearchValues() {
    const beforeInParams = searchParams.get("before");
    const afterInParams = searchParams.get("after");
    const featuredOnlyInParams = searchParams.get("featuredOnly");
    const designTypeInParams = searchParams.get("designType");
    const subcategoryInParams = searchParams.get("subcategory");
    const statusInParams = searchParams.get("status");

    return {
      subcategory:
        subcategoryInParams === null
          ? "none"
          : decodeURIComponent(subcategoryInParams),
      status: statusInParams === null ? "none" : statusInParams,
      age:
        beforeInParams !== null
          ? "old"
          : afterInParams !== null
          ? "new"
          : "none",
      featuredOnly: featuredOnlyInParams === null ? false : true,
      designType: `${designTypeInParams}`,
    };
  }

  return (
    <div>
      <select onChange={onChangeCategory} value={subcategory}>
        <option value="none">Any Category</option>
        {categoriesToShow.map((cat) => (
          <optgroup key={cat.id} label={cat.name}>
            {cat.designSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <select onChange={onChangeStatus} value={status}>
        <option value="none">Any Status</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </select>
      <select onChange={onChangeAge} value={age}>
        <option value={"none"}>Any Age</option>
        <option value={"new"}>New Designs</option>
        <option value={"old"}>Classics</option>
      </select>
      <label htmlFor="featured">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          onChange={onChangeFeaturedOnly}
          checked={featuredOnly}
        />
        Featured Only
      </label>
    </div>
  );
}
