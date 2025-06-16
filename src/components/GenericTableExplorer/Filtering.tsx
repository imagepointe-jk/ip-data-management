import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "@/styles/GenericTableExplorer/genericTableExplorer.module.css";

type Dropdown = {
  paramName: string;
  label: string;
  hideEmptyOption?: boolean; //whether to hide the default "Select..." option first in the list
  defaultValue?: string;
  options: {
    displayName: string;
    value: string;
  }[];
};
export type Props = {
  dropdowns?: Dropdown[];
  hideSearch?: boolean;
};
export function Filtering({ dropdowns, hideSearch }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const router = useRouter();

  function onClickSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newParams = new URLSearchParams(searchParams);
    newParams.set("search", search);
    router.push(`${pathname}?${newParams}`);
  }

  function onClickClearSearch() {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearch("");
    router.push(`${pathname}?${newParams}`);
  }

  function onClickDropdownValue(paramName: string, clickedValue: string) {
    const newParams = new URLSearchParams(searchParams);
    if (clickedValue === "unset") newParams.delete(paramName);
    else newParams.set(paramName, clickedValue);
    router.push(`${pathname}?${newParams}`);
  }

  return (
    <div className={styles["filters-row"]}>
      {hideSearch !== true && (
        <form onSubmit={(e) => onClickSearch(e)}>
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
          <button
            className="button-beta"
            onClick={onClickClearSearch}
            type="button"
          >
            Clear Search
          </button>
        </form>
      )}
      {dropdowns &&
        dropdowns.map((item) => (
          <div key={item.paramName} className={styles["dropdown-container"]}>
            <div>{item.label}</div>
            <select
              defaultValue={searchParams.get(item.paramName) || undefined}
              onChange={(e) =>
                onClickDropdownValue(item.paramName, e.target.value)
              }
            >
              {[
                !item.hideEmptyOption && (
                  <option key={"unset"} value={"unset"}>
                    Select...
                  </option>
                ),
                ...item.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.displayName}
                  </option>
                )),
              ]}
            </select>
          </div>
        ))}
    </div>
  );
}
