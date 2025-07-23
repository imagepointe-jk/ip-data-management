import { env } from "@/envClient";
import { validateGoogleFontsJson } from "@/types/validations/customizer";
import { useEffect, useState } from "react";
import styles from "@/styles/customizer/CustomProductDesigner/textEditor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { GoogleFont } from "@/types/schema/customizer";
import { FontSelectorItem } from "./FontSelectorItem";
import { FixedSizeList } from "react-window";

type Props = {
  selectedFont: string | undefined;
  selectedEditorGuid: string | null;
};
export function FontSelector({ selectedFont }: Props) {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [expanded, setExpanded] = useState(false);

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
            <FixedSizeList
              height={150}
              width={237}
              itemSize={50}
              itemCount={fonts.length}
              itemData={fonts}
            >
              {FontSelectorItem}
            </FixedSizeList>
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
