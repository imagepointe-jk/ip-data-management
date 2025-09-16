import styles from "@/styles/designs/DesignPage.module.css";
import { CategoryDTO } from "@/types/dto/designs";
import { useState } from "react";

type Props = {
  designTypeId: number;
  selectedSubcategoryIds: number[];
  categories: CategoryDTO[];
  onClickSubcategory: (id: number) => void;
  scrollBoxClassName?: string;
};
export function Categories({
  designTypeId,
  selectedSubcategoryIds,
  categories,
  onClickSubcategory,
  scrollBoxClassName,
}: Props) {
  const [search, setSearch] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  return (
    <div className={styles["categories-container"]}>
      <h4>Categories</h4>
      <div>
        <input
          type="search"
          className={styles["search-input"]}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={showOnlySelected}
            onChange={(e) => setShowOnlySelected(e.target.checked)}
          />
          Selected Only
        </label>
      </div>
      <div className={`${styles["scroll-box"]} ${scrollBoxClassName || ""}`}>
        {categories.map((cat) => (
          <div key={cat.id}>
            <h5>{cat.name}</h5>
            {cat.designSubcategories
              .filter((sub) => {
                const searchCondition =
                  !search ||
                  sub.name
                    .toLocaleLowerCase()
                    .startsWith(search.toLocaleLowerCase());
                const selectedCondition =
                  !showOnlySelected || selectedSubcategoryIds.includes(sub.id);
                return searchCondition && selectedCondition;
              })
              .map((sub) => (
                <div key={sub.id}>
                  <label
                    style={{
                      color:
                        cat.designTypeId !== designTypeId
                          ? "lightgray"
                          : undefined,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubcategoryIds.includes(sub.id)}
                      onChange={() => onClickSubcategory(sub.id)}
                      disabled={cat.designTypeId !== designTypeId}
                    />
                    {sub.name}
                  </label>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
