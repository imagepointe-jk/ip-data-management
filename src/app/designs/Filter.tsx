"use client";

import { getDesignCategoryHierarchy } from "@/db/access/designs";
import { UnwrapPromise } from "@/types/types";
import { getTimeStampYearsAgo } from "@/utility/misc";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

type Props = {
  categories: UnwrapPromise<ReturnType<typeof getDesignCategoryHierarchy>>;
};
export default function Filter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategoryInParams = decodeURIComponent(
    `${searchParams.get("subcategory")}`
  );
  const statusInParams = decodeURIComponent(`${searchParams.get("status")}`);
  const featuredOnlyInParams = searchParams.get("featuredOnly") === "true";
  const designTypeInParams = searchParams.get("designType");
  const categoriesToShow = categories.filter(
    (cat) =>
      (cat.designType.name === "Embroidery" &&
        designTypeInParams === "Embroidery") ||
      (designTypeInParams !== "Embroidery" &&
        cat.designType.name !== "Embroidery")
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

  return (
    <div>
      <select onChange={onChangeCategory} defaultValue={subcategoryInParams}>
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
      <select onChange={onChangeStatus} defaultValue={statusInParams}>
        <option value="none">Any Status</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </select>
      <select onChange={onChangeAge}>
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
          defaultChecked={featuredOnlyInParams}
        />
        Featured Only
      </label>
    </div>
  );
}
