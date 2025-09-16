import styles from "@/styles/designs/DesignPage.module.css";
import { useState } from "react";

type Props = {
  selectedTagIds: number[];
  tags: { id: number; name: string }[];
  onClickTag: (id: number) => void;
  scrollBoxClassName?: string;
};
export function Tags({
  selectedTagIds,
  tags,
  onClickTag,
  scrollBoxClassName,
}: Props) {
  const [search, setSearch] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const tagsToShow = tags.filter((tag) => {
    const searchCondition =
      !search ||
      tag.name.toLocaleLowerCase().startsWith(search.toLocaleLowerCase());
    const selectedCondition =
      !showOnlySelected || selectedTagIds.includes(tag.id);
    return searchCondition && selectedCondition;
  });
  tagsToShow.sort((a, b) => (a.name > b.name ? 1 : -1));

  return (
    <div className={styles["tags-container"]}>
      <h4>Tags</h4>

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
        {tagsToShow.map((tag) => (
          <div key={tag.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => onClickTag(tag.id)}
              />
              {tag.name}
            </label>
            {/* <label htmlFor={`tag-${tag.id}`}>{tag.name}</label> */}
          </div>
        ))}
      </div>
    </div>
  );
}
