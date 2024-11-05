import { useEffect, useState } from "react";
import { useProduct } from "./WCProductProvider";
import {
  CalculatePriceParams,
  DecorationType,
  EstimateResponse,
} from "@/types/schema/pricing";
import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";
import { PrintFields } from "./PrintFields";
import { EmbroideryFields } from "./EmbroideryFields";
import { getPriceEstimate } from "@/fetch/client/pricing";
import { validateEstimateResponse } from "@/types/validations/pricing";

export function PricingCalculator() {
  const [quantity, setQuantity] = useState(100);
  const [printLocations, setPrintLocations] = useState(1);
  const [embLocations, setEmbLocations] = useState(1);
  const [decorationType, setDecorationType] = useState(
    "Embroidery" as DecorationType
  );
  const [estimateResponse, setEstimateResponse] = useState(
    null as EstimateResponse | null
  );
  const {
    productData: { net, decorationType: decorationTypeProduct, markupSchedule },
  } = useProduct();

  if (estimateResponse !== null)
    estimateResponse.results.sort((a, b) => a.quantity - b.quantity);
  const estimateForRequestedQuantity =
    estimateResponse !== null
      ? estimateResponse.results.find((thisItem, i, arr) => {
          const nextItem = arr[i + 1];
          return (
            nextItem === undefined ||
            (nextItem.quantity > quantity && thisItem.quantity <= quantity)
          );
        })
      : null;
  const quantityBreaks = [48, 72, 144, 288, 500];

  function buildRequestData(): CalculatePriceParams {
    return {
      decorationType,
      locations: [
        {
          colorCount: 1,
        },
      ],
      productData: {
        net,
        type: "tshirt",
      },
      quantities: quantityBreaks,
    };
  }

  async function getPrice() {
    try {
      const response = await getPriceEstimate(buildRequestData());
      if (!response.ok) throw new Error(`API error ${response.status}`);

      const json = await response.json();
      console.log(json);
      const parsed = validateEstimateResponse(json);
      setEstimateResponse(parsed);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getPrice();
  }, [quantity]);

  return (
    <div className={styles["main"]}>
      <div className={styles["row"]}>
        <label htmlFor="decoration-type" className={styles["label"]}>
          Decoration Method
        </label>
        <select
          name="decoration-type"
          id="decoration-type"
          value={decorationType}
          onChange={(e) => setDecorationType(e.target.value as DecorationType)}
        >
          <option value="Screen Print">Screen Print</option>
          <option value="Embroidery">Embroidery</option>
        </select>
      </div>
      <div className={styles["row"]}>
        <label htmlFor="quantity" className={styles["label"]}>
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
        />
      </div>
      {decorationType === "Screen Print" && (
        <PrintFields
          printLocations={printLocations}
          setPrintLocations={setPrintLocations}
        />
      )}
      {decorationType === "Embroidery" && (
        <EmbroideryFields
          embLocations={embLocations}
          setEmbLocations={setEmbLocations}
        />
      )}
      <hr />
      <div className={styles["row"]}>
        <div className={styles["label"]}>Estimate</div>
        <div>
          {estimateForRequestedQuantity
            ? `$${estimateForRequestedQuantity.result.toFixed(
                2
              )} per piece (S-XL)`
            : "..."}
        </div>
      </div>
      <hr />
      <div className={styles["expandable-toggle"]}>+ View Price Breaks</div>
      <div className={styles["vert-flex-group"]}>
        {quantityBreaks.map((thisQuantity, i, arr) => {
          const nextQuantity = arr[i + 1];
          const matchingResult = estimateResponse?.results.find(
            (result) => result.quantity === thisQuantity
          );
          const rangeLabel = nextQuantity
            ? `${thisQuantity}-${nextQuantity - 1}`
            : `${thisQuantity}+`;
          return (
            <div key={thisQuantity} className={styles["price-break-row"]}>
              <div>{rangeLabel}</div>
              <div>
                {matchingResult
                  ? `$${matchingResult.result.toFixed(2)}`
                  : "..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
