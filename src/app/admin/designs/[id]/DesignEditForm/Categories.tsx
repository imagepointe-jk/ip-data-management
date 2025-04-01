import styles from "@/styles/designs/DesignPage.module.css";
import {
  DesignCategoryWithIncludes,
  DesignWithIncludes,
} from "@/types/schema/designs";

type Props = {
  //   design: DesignWithIncludes;
  designTypeId: number;
  selectedSubcategoryIds: number[];
  categories: DesignCategoryWithIncludes[];
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
  //   const selectedSubcategoryIds = design.designSubcategories.map(
  //     (cat) => cat.id
  //   );

  return (
    <div>
      <h4>Categories</h4>
      <div className={`${styles["scroll-box"]} ${scrollBoxClassName || ""}`}>
        {categories.map((cat) => (
          <div key={cat.id}>
            <h5>{cat.name}</h5>
            {cat.designSubcategories.map((sub) => (
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
                    //   id={`subcategory-${sub.id}`}
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
