import { env } from "@/envClient";
import { validateGoogleFontsJson } from "@/types/validations/customizer";
import { useEffect, useState } from "react";
import styles from "@/styles/customizer/CustomProductDesigner/textEditor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { GoogleFont } from "@/types/schema/customizer";
import { getArrayPage } from "@/utility/misc";
import { FontSelectorItem } from "./FontSelectorItem";

const PAGE_SIZE = 10;
type Props = {
  selectedFont: string | undefined;
  selectedEditorGuid: string | null;
};
export function FontSelector({ selectedFont, selectedEditorGuid }: Props) {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const fontsPage = getArrayPage(fonts, page, PAGE_SIZE);
  const lastPage = Math.ceil(fonts.length / PAGE_SIZE);
  const canClickPrev = page > 1;
  const canClickNext = page < lastPage;

  async function loadFonts() {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY}`
    );
    if (!response.ok) {
      console.error(response.status);
      return;
    }
    const json = await response.json();
    const parsed = validateGoogleFontsJson(json);
    setFonts(parsed);
  }

  function onClickPageButton(direction: "prev" | "next") {
    if (direction === "prev" && !canClickPrev) return;
    if (direction === "next" && !canClickNext) return;

    const increment = direction === "prev" ? -1 : 1;
    setPage(page + increment);
  }

  useEffect(() => {
    loadFonts();
  }, []);

  return (
    <div className={styles["font-selector-main"]}>
      Font
      <div
        className={styles["fake-dropdown-main"]}
        onClick={() => setExpanded(!expanded)}
      >
        {selectedFont && (
          <span style={{ fontFamily: selectedFont }}>{selectedFont}</span>
        )}
        {!selectedFont && "Select..."}
        {expanded && (
          <div className={styles["fake-dropdown"]}>
            <div className={styles["fake-dropdown-scroll"]}>
              {fontsPage.map((font) => (
                <FontSelectorItem
                  key={font.family}
                  font={font}
                  selectedEditorGuid={selectedEditorGuid}
                />
              ))}
            </div>
            <div className={styles["fake-dropdown-page-buttons-container"]}>
              <button
                className={styles["fake-dropdown-page-button"]}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickPageButton("prev");
                }}
                disabled={!canClickPrev}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Previous
              </button>
              <button
                className={styles["fake-dropdown-page-button"]}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickPageButton("next");
                }}
                disabled={!canClickNext}
              >
                Next <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={styles["fake-dropdown-arrow"]}
        />
      </div>
    </div>
  );
}
