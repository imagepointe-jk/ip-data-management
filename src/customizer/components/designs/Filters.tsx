import stylesDesignPicker from "@/styles/customizer/CustomProductDesigner/designPicker.module.css";
import styles from "@/styles/customizer/CustomProductDesigner/designFilters.module.css";
import { faMinus, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDesignDataSelector } from "@/customizer/redux/slices/designData";
import {
  setDesignBrowserSubcategoryId,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";

type Props = {
  closeFilters: () => void;
};
export function Filters({ closeFilters }: Props) {
  const { categories } = useDesignDataSelector();
  const { designBrowserData } = useEditorSelectors();
  const categoryWithSelectedSubcategory = categories.find(
    (cat) =>
      !!cat.designSubcategories.find(
        (sub) => sub.id === designBrowserData.subcategoryId
      )
  );
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    categoryWithSelectedSubcategory ? categoryWithSelectedSubcategory.id : null
  );
  const dispatch = useDispatch();
  const filteredCategories = categories.filter(
    (cat) => cat.designType.name === "Screen Print"
  );
  const expandedCategory = categories.find(
    (cat) => cat.id === expandedCategoryId
  );

  function onClickCategory(id: number) {
    if (expandedCategoryId === id) setExpandedCategoryId(null);
    else setExpandedCategoryId(id);
  }

  function onClickSubcategory(id: number) {
    dispatch(setDesignBrowserSubcategoryId(id));
    closeFilters();
  }

  return (
    <div className={stylesDesignPicker["filters-container"]}>
      {/* Library selector is temporarily disabled */}
      {/* <div className={styles["library-toggle-container"]}>
        <button
          className={`${styles["library-toggle-item"]} ${
            designBrowserData.library === "screen print"
              ? styles["selected"]
              : ""
          }`}
        >
          Screen Print
        </button>
        <button
          className={`${styles["library-toggle-item"]} ${
            designBrowserData.library === "embroidery" ? styles["selected"] : ""
          }`}
        >
          Embroidery
        </button>
      </div> */}

      <div className={styles["scroll-container"]}>
        {filteredCategories.map((cat) => (
          <Fragment key={cat.id}>
            <button onClick={() => onClickCategory(cat.id)}>
              <FontAwesomeIcon
                icon={cat.id === expandedCategory?.id ? faMinus : faPlus}
              />{" "}
              {cat.name}
            </button>
            {expandedCategory && cat.id === expandedCategory.id && (
              <div className={styles["subcategories"]}>
                {expandedCategory.designSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    className={
                      designBrowserData.subcategoryId === sub.id
                        ? styles["selected"]
                        : undefined
                    }
                    onClick={() => onClickSubcategory(sub.id)}
                  >
                    {designBrowserData.subcategoryId === sub.id && (
                      <div
                        className={styles["selected-subcategory-indicator"]}
                      ></div>
                    )}
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <button className={styles["close-x"]} onClick={closeFilters}>
        <FontAwesomeIcon icon={faXmark} size="2x" />
      </button>
    </div>
  );
}
