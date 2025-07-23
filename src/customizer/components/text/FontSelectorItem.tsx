import { GoogleFont } from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner/textEditor.module.css";
import { CSSProperties, useEffect } from "react";
import { useDispatch } from "react-redux";
import { editText } from "@/customizer/redux/slices/cart";
import { useEditorSelectors } from "@/customizer/redux/slices/editor";

type Props = {
  data: GoogleFont[];
  index: number;
  style: CSSProperties;
};
export function FontSelectorItem({ data, index, style }: Props) {
  const { selectedEditorGuid } = useEditorSelectors();
  const dispatch = useDispatch();
  const font = data[index];
  function isFontAdded(key: string) {
    for (const font of document.fonts) {
      if (font.family === key) return true;
    }
    return false;
  }

  function onClick() {
    if (!selectedEditorGuid || !font) return;

    dispatch(
      editText({
        guid: selectedEditorGuid,
        style: {
          fontFamily: font.family,
        },
      })
    );
  }

  useEffect(() => {
    if (!font || isFontAdded(font.family)) return;

    const fontFace = new FontFace(font.family, `url("${font.url}")`);
    document.fonts.add(fontFace);
  }, []);

  return (
    <div
      className={styles["font-item"]}
      style={{ ...style, width: "90%" }}
      onClick={onClick}
    >
      <div className={styles["font-label"]}>{font?.family || "UNKNOWN"}</div>
      <div
        style={{ fontFamily: font?.family }}
        className={styles["font-example"]}
      >
        The quick brown fox jumped over the lazy dog
        <div className={styles["font-example-fade"]}></div>
      </div>
    </div>
  );
}
