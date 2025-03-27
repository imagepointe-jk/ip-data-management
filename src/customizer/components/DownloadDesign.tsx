import {
  getRenderedSingleView,
  getRenderedVariationViews,
} from "@/fetch/client/customizer";
import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";
import styles from "@/styles/customizer/CustomProductDesigner/download.module.css";
import { findViewInProductData } from "../utils";
import Konva from "konva";
import { forceClientDownload } from "@/utility/misc";
import { useDispatch } from "react-redux";

export function DownloadDesign() {
  const { selectedVariation, selectedView, selectedProductData } =
    useEditorSelectors();
  const productName = selectedProductData.product?.name || "UNKNOWN PRODUCT";
  const colorName =
    selectedProductData.variations.find(
      (variation) => variation.id === selectedVariation.id
    )?.color.name || "UNKNOWN COLOR";
  const dispatch = useDispatch();

  async function downloadVariationViews() {
    console.log("download all views");
    // try {
    //   const response = await getRenderedVariationViews(selectedVariation);
    //   if (!response.ok) {
    //     const json = await response.json();
    //     throw new Error(json.message);
    //   }
    //   const blob = await response.blob();
    //   forceClientDownloadBlob(blob, "my-design");
    // } catch (error) {
    //   console.error(error);
    // }
  }

  async function downloadSingleView() {
    const stage = Konva.stages[0];
    if (!stage) throw new Error("No Konva stage!");

    dispatch(setSelectedEditorGuid(null));
    const dataURL = stage.toDataURL({ mimeType: "image/jpeg", quality: 1 });
    forceClientDownload(dataURL, "my-image");
  }

  return (
    <div className={styles["main"]}>
      <h2>Download</h2>
      <div>What do you want to download?</div>
      {/* //TODO: Discuss how to handle downloading multiple views. Is the average user comfortable with ZIP? Is it better to auto-download many individual files?
      <div className={styles["download-option-container"]}>
        <div>
          Entire design for {productName} ({colorName})
        </div>
        <div>
          <button onClick={downloadVariationViews}>Download Now</button>
        </div>
      </div> */}
      <div className={styles["download-option-container"]}>
        <div>Just this view</div>
        <div>
          <button onClick={downloadSingleView}>Download Now</button>
        </div>
      </div>
    </div>
  );
}
