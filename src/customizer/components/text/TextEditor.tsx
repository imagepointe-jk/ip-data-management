import { addText, editText } from "@/customizer/redux/slices/cart";
import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";
import { StoreType } from "@/customizer/redux/store";
// import { findTextInCart } from "@/customizer/utils";
import { ChangeEvent, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import stylesMain from "@/styles/customizer/CustomProductDesigner/main.module.css";
import styles from "@/styles/customizer/CustomProductDesigner/textEditor.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import debounce from "lodash.debounce";

export function TextEditor() {
  const dispatch = useDispatch();
  const { selectedProductData, selectedEditorGuid, selectedView } =
    useEditorSelectors();
  // const selectedLocationId = useSelector(
  //   (store: StoreType) => store.editorState.selectedLocationId
  // );
  const store = useSelector((store: StoreType) => store);
  // const selectedText = selectedEditorGuid
  //   ? findTextInCart(store.cart.present, selectedEditorGuid)
  //   : undefined;
  // const onChangeColor = useCallback(
  //   debounce((hexCode: string) => {
  //     if (!selectedEditorGuid || !selectedText) return;
  //     dispatch(
  //       editText({
  //         guid: selectedEditorGuid,
  //         style: {
  //           hexCode,
  //         },
  //       })
  //     );
  //   }, 500),
  //   [selectedEditorGuid, selectedText]
  // );

  function onClickAdd() {
    const newGuid = uuidv4();
    dispatch(
      addText({
        newGuid,
        // targetLocationId: selectedLocationId,
        targetProductData: selectedProductData,
        targetViewId: selectedView.id,
      })
    );
    dispatch(setSelectedEditorGuid(newGuid));
  }

  function onChangeText(e: ChangeEvent<HTMLTextAreaElement>) {
    if (!selectedEditorGuid) return;

    dispatch(editText({ guid: selectedEditorGuid, text: e.target.value }));
  }

  function onClickStyle(clickedStyle: "bold" | "italic") {
    console.log("click style");
    // if (!selectedEditorGuid || !selectedText) return;

    // const {
    //   textData: { style },
    // } = selectedText;
    // const curStyle = style?.fontStyle || "";
    // let bold = curStyle.includes("bold");
    // let italic = curStyle.includes("italic");
    // if (clickedStyle === "bold") bold = !bold;
    // if (clickedStyle === "italic") italic = !italic;

    // dispatch(
    //   editText({
    //     guid: selectedEditorGuid,
    //     style: {
    //       fontStyle:
    //         bold && !italic
    //           ? "bold"
    //           : !bold && italic
    //           ? "italic"
    //           : bold && italic
    //           ? "italic bold"
    //           : null,
    //     },
    //   })
    // );
  }

  function onClickDecoration(clickedDecoration: "underline" | "line-through") {
    console.log("click decoration");
    // if (!selectedEditorGuid || !selectedText) return;

    // const {
    //   textData: { style },
    // } = selectedText;
    // let decoration = style?.textDecoration || null;

    // dispatch(
    //   editText({
    //     guid: selectedEditorGuid,
    //     style: {
    //       textDecoration:
    //         clickedDecoration === decoration ? null : clickedDecoration,
    //     },
    //   })
    // );
  }

  function onClickAlign(clickedAlign: "left" | "center" | "right") {
    console.log("click align");
    // if (!selectedEditorGuid || !selectedText) return;

    // dispatch(
    //   editText({
    //     guid: selectedEditorGuid,
    //     style: {
    //       align: clickedAlign,
    //     },
    //   })
    // );
  }

  return (
    <div className={styles["main"]}>
      <h2>Edit Text</h2>
      <div>
        <textarea
          cols={30}
          rows={3}
          // value={selectedText?.textData.text || ""}
          onChange={onChangeText}
          // disabled={!selectedText}
        ></textarea>
      </div>
      {/* {selectedText && (
        <div className={styles["styles-container"]}>
          <div>
            Style
            <div className={styles["button-row"]}>
              <button
                className={`${
                  selectedText.textData.style?.fontStyle?.includes("bold")
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickStyle("bold")}
              >
                <FontAwesomeIcon icon={faBold} />
              </button>
              <button
                className={`${
                  selectedText.textData.style?.fontStyle?.includes("italic")
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickStyle("italic")}
              >
                <FontAwesomeIcon icon={faItalic} />
              </button>
              <button
                className={`${
                  selectedText.textData.style?.textDecoration === "underline"
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickDecoration("underline")}
              >
                <FontAwesomeIcon icon={faUnderline} />
              </button>
              <button
                className={`${
                  selectedText.textData.style?.textDecoration === "line-through"
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickDecoration("line-through")}
              >
                <FontAwesomeIcon
                  onClick={() => onClickDecoration("line-through")}
                  icon={faStrikethrough}
                />
              </button>
            </div>
          </div>
          <div>
            Color
            <div>
              <input
                type="color"
                value={selectedText.textData.style?.hexCode}
                onChange={(e) => onChangeColor(e.target.value)}
              />
            </div>
          </div>
          <div>
            Align
            <div className={styles["button-row"]}>
              <button
                className={`${
                  selectedText.textData.style?.align === "left"
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickAlign("left")}
              >
                <FontAwesomeIcon icon={faAlignLeft} />
              </button>
              <button
                className={`${
                  selectedText.textData.style?.align === "center"
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickAlign("center")}
              >
                <FontAwesomeIcon icon={faAlignCenter} />
              </button>
              <button
                className={`${
                  selectedText.textData.style?.align === "right"
                    ? styles["style-button-active"]
                    : ""
                }`}
                onClick={() => onClickAlign("right")}
              >
                <FontAwesomeIcon icon={faAlignRight} />
              </button>
            </div>
          </div>
        </div>
      )} */}
      <button className={stylesMain["basic-button"]} onClick={onClickAdd}>
        Add Text
      </button>
    </div>
  );
}
