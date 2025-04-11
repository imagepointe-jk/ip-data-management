import {
  setSelectedEditorGuid,
  useEditorSelectors,
} from "../redux/slices/editor";
import styles from "@/styles/customizer/CustomProductDesigner/download.module.css";
import Konva from "konva";
import { forceClientDownload, waitForMs } from "@/utility/misc";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useEditor } from "../EditorProvider";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const downloadDelayMs = 500; //artificial delay to introduce after starting each image download, to reduce chance of downloads interfering with each other
export function DownloadDesign() {
  const [selectedViewIds, setSelectedViewIds] = useState<number[]>([]);
  const [downloadingViewId, setDownloadingViewId] = useState<number | null>(
    null
  );
  const { selectedView, selectedProductData } = useEditorSelectors();
  const cart = useSelector((state: StoreType) => state.cart);
  const { updateViewRender } = useEditor();
  const dispatch = useDispatch();

  const product = cart.present.products[0];
  const allViews = product
    ? product.variations.map((variation) => variation.views).flat()
    : [];
  const validViews = allViews.filter(
    (view) => view.artworks.length > 0 || view.texts.length > 0
  );

  function onClickView(id: number) {
    if (
      downloadingViewId !== null ||
      !validViews.find((view) => view.id === id)
    )
      return;

    if (selectedViewIds.includes(id))
      setSelectedViewIds(selectedViewIds.filter((viewId) => viewId !== id));
    else setSelectedViewIds([...selectedViewIds, id]);
  }

  function selectAll() {
    if (!product) return;

    setSelectedViewIds(validViews.map((view) => view.id));
  }

  function deselectAll() {
    setSelectedViewIds([]);
  }

  async function downloadSelected() {
    const stage = Konva.stages[0];
    if (!stage) throw new Error("No Konva stage!");
    if (!product) return;

    for (const id of selectedViewIds) {
      const variationWithMatchingView = product.variations.find(
        (variation) => !!variation.views.find((view) => view.id === id)
      );
      const matchingView = variationWithMatchingView?.views.find(
        (view) => view.id === id
      );

      const variationDataWithMatchingView = selectedProductData.variations.find(
        (variation) => !!variation.views.find((view) => view.id === id)
      );
      const matchingViewData = variationDataWithMatchingView?.views.find(
        (view) => view.id === id
      );

      const filename = `${
        selectedProductData.product?.name || "UNKNOWN PRODUCT"
      } design - ${
        variationDataWithMatchingView?.color.name || "UNKNOWN VARIATION"
      } - ${matchingViewData?.name} view`;

      if (!matchingView) continue;
      setDownloadingViewId(id);
      forceClientDownload(matchingView.currentRenderUrl, filename);
      await waitForMs(downloadDelayMs);
    }
    setDownloadingViewId(null);
    setSelectedViewIds([]);
  }

  useEffect(() => {
    dispatch(setSelectedEditorGuid(null));
    updateViewRender(selectedView.id);
  }, []);

  return (
    <div className={styles["main"]}>
      <h2>Download</h2>
      <div>What do you want to download?</div>
      <div className={styles["select-buttons"]}>
        <button
          className="button-small"
          onClick={selectAll}
          disabled={downloadingViewId !== null}
        >
          Select All
        </button>
        <button
          className="button-small"
          onClick={deselectAll}
          disabled={downloadingViewId !== null}
        >
          Deselect All
        </button>
      </div>
      <div className={styles["scroll-container"]}>
        {!product && <div>ERROR: NO PRODUCT</div>}
        {product && (
          <div className={styles["variations-flex"]}>
            {product.variations.map((variation) => {
              const matchingVariation = selectedProductData.variations.find(
                (productDataVariation) =>
                  productDataVariation.id === variation.id
              );
              const name = matchingVariation?.color.name || "INVALID VARIATION";
              return (
                <div key={variation.id}>
                  <div className={styles["variation-heading"]}>{name}</div>
                  {variation.views.map((view) => {
                    const matchingView = matchingVariation?.views.find(
                      (productDataView) => productDataView.id === view.id
                    );
                    const name = matchingView?.name || "INVALID VIEW";
                    const valid = !!validViews.find(
                      (validView) => validView.id === view.id
                    );
                    return (
                      <label
                        key={view.id}
                        className={`${styles["variation-view-option"]} ${
                          !valid ? styles["invalid"] : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          onChange={() => onClickView(view.id)}
                          checked={selectedViewIds.includes(view.id)}
                          disabled={!valid}
                        />
                        {name} View{" "}
                        {!valid && (
                          <span className={styles["invalid-message"]}>
                            (not decorated)
                          </span>
                        )}
                        {downloadingViewId === view.id && (
                          <LoadingIndicator
                            className={styles["variation-view-option-spinner"]}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button
        className={styles["download-button"]}
        onClick={downloadSelected}
        disabled={selectedViewIds.length === 0 || downloadingViewId !== null}
      >
        <FontAwesomeIcon icon={faDownload} /> Download {selectedViewIds.length}{" "}
        View(s)
      </button>
    </div>
  );
}
