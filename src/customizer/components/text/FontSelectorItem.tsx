import { GoogleFont } from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner/textEditor.module.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { editText } from "@/customizer/redux/slices/cart";

type Props = {
  font: GoogleFont;
  selectedEditorGuid: string | null;
};
export function FontSelectorItem({ font, selectedEditorGuid }: Props) {
  const dispatch = useDispatch();
  function isFontAdded(key: string) {
    for (const font of document.fonts) {
      if (font.family === key) return true;
    }
    return false;
  }

  function onClick() {
    if (!selectedEditorGuid) return;

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
    if (isFontAdded(font.family)) return;

    const fontFace = new FontFace(font.family, `url("${font.url}")`);
    document.fonts.add(fontFace);
  }, []);

  return (
    <div className={styles["font-item"]} onClick={onClick}>
      <div className={styles["font-label"]}>{font.family}</div>
      <div
        style={{ fontFamily: font.family }}
        className={styles["font-example"]}
      >
        The quick brown fox jumped over the lazy dog
        <div className={styles["font-example-fade"]}></div>
      </div>
    </div>
  );
}
