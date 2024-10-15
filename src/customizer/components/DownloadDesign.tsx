import { getRenderedVariationViews } from "@/fetch/client/customizer";
import { useEditorSelectors } from "../redux/slices/editor";
import { forceClientDownloadBlob } from "@/utility/misc";
import styles from "@/styles/customizer/CustomProductDesigner/download.module.css";

export function DownloadDesign() {
  const { selectedVariation, selectedProductData } = useEditorSelectors();
  const productName = selectedProductData.product?.name || "UNKNOWN PRODUCT";
  const colorName =
    selectedProductData.variations.find(
      (variation) => variation.id === selectedVariation.id
    )?.color.name || "UNKNOWN COLOR";

  async function downloadVariationViews() {
    try {
      const response = await getRenderedVariationViews(selectedVariation);
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
      }
      const blob = await response.blob();
      forceClientDownloadBlob(blob, "my-design");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["main"]}>
      <h2>Download</h2>
      <div>What do you want to download?</div>
      <div className={styles["download-option-container"]}>
        <div>
          Entire design for {productName} ({colorName})
        </div>
        <div>
          <button onClick={downloadVariationViews}>Download Now</button>
        </div>
      </div>
    </div>
  );
}
