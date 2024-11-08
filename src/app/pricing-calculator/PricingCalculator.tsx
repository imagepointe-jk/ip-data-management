import { useCallback, useEffect, useRef, useState } from "react";
import { useProduct } from "./WCProductProvider";
import {
  CalculatePriceParams,
  DecorationType,
  EstimateResponse,
  ProductCalcType,
} from "@/types/schema/pricing";
import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";
import { PrintFields } from "./PrintFields";
import { EmbroideryFields } from "./EmbroideryFields";
import { getPriceEstimate } from "@/fetch/client/pricing";
import { validateEstimateResponse } from "@/types/validations/pricing";
import debounce from "lodash.debounce";
import { ExpandableSection } from "./ExpandableSection";
import { DecorationLocations } from "./DecorationLocations";
import { useIframe } from "@/components/IframeHelper/IframeHelperProvider";

export type StitchCount = "0k" | "5k" | "10k" | "15k";
type BuildRequestDataParams = {
  decorationType: DecorationType;
  printLocations: number;
  embLocations: number;
  location1Colors: number;
  location2Colors: number;
  location3Colors: number;
  location4Colors: number;
  location1Stitches: StitchCount;
  location2Stitches: StitchCount;
  location3Stitches: StitchCount;
  location4Stitches: StitchCount;
};
export function PricingCalculator() {
  //data from WC product
  const {
    productData: { net, markupSchedule },
  } = useProduct();
  const productType = markupScheduleToProductType(markupSchedule);
  const allowPrint = productType === "tshirt" || productType === "polo";
  const allowEmbroidery = productType !== "tshirt";

  //expanded section state

  const [expandedSection, setExpandedSection] = useState(
    null as "price breaks" | "locations" | "terms" | null
  );

  //ref for main container

  const mainRef = useRef(null as HTMLDivElement | null);

  //hook into iframe provider to allow iframe height changes

  const {
    parentWindow: { requestHeightChange },
  } = useIframe();

  //form state

  const [quantity, setQuantity] = useState(100);
  const [printLocations, setPrintLocations] = useState(1);
  const [embLocations, setEmbLocations] = useState(1);
  const [decorationType, setDecorationType] = useState(
    (allowPrint ? "Screen Print" : "Embroidery") as DecorationType
  );

  //form state (location counts)

  const [location1Colors, setLocation1Colors] = useState(1);
  const [location2Colors, setLocation2Colors] = useState(1);
  const [location3Colors, setLocation3Colors] = useState(1);
  const [location4Colors, setLocation4Colors] = useState(1);

  const [location1Stitches, setLocation1Stitches] = useState(
    "0k" as StitchCount
  );
  const [location2Stitches, setLocation2Stitches] = useState(
    "0k" as StitchCount
  );
  const [location3Stitches, setLocation3Stitches] = useState(
    "0k" as StitchCount
  );
  const [location4Stitches, setLocation4Stitches] = useState(
    "0k" as StitchCount
  );

  //API response

  const [estimateResponse, setEstimateResponse] = useState(
    null as EstimateResponse | null
  );

  //sort to make sure we search the results in ascending order
  if (estimateResponse !== null)
    estimateResponse.results.sort((a, b) => a.quantity - b.quantity);

  //main estimate for the quantity the user entered
  const estimateForRequestedQuantity =
    quantity >= 48 && estimateResponse !== null
      ? estimateResponse.results.find((thisItem, i, arr) => {
          const nextItem = arr[i + 1];
          return (
            nextItem === undefined ||
            (nextItem.quantity > quantity && thisItem.quantity <= quantity)
          );
        })
      : null;

  const quantityBreaks = [48, 72, 144, 288, 500];

  //debounced function for getting the price via API
  const getPriceDebounced = useCallback(
    debounce(async (params: BuildRequestDataParams) => {
      try {
        const response = await getPriceEstimate(buildRequestData(params));
        if (!response.ok) throw new Error(`API error ${response.status}`);

        const json = await response.json();
        const parsed = validateEstimateResponse(json);
        setEstimateResponse(parsed);
      } catch (error) {
        console.error(error);
      }
    }, 500),
    []
  );

  function stitchCountToNumber(stitchCount: StitchCount) {
    return +stitchCount.replace("k", "") * 1000;
  }

  //handle the old labeling system used in woocommerce for garments
  //this will need to be changed if we switch to a different data structure for our WC products in the future
  function markupScheduleToProductType(
    markupSchedule: string
  ): ProductCalcType {
    switch (markupSchedule) {
      case "one":
        return "tshirt";
      case "two":
        return "polo";
      case "three":
        return "polo";
      case "four":
        return "hat";
      case "five":
        return "hat";
      case "six":
        return "hat";
      case "seven":
        return "hat";
      case "eight":
        return "hat";
      default:
        return "tshirt";
    }
  }

  function buildRequestData(
    params: BuildRequestDataParams
  ): CalculatePriceParams {
    const {
      decorationType,
      embLocations,
      location1Colors,
      location1Stitches,
      location2Colors,
      location2Stitches,
      location3Colors,
      location3Stitches,
      location4Colors,
      location4Stitches,
      printLocations,
    } = params;
    const locationCount =
      decorationType === "Screen Print" ? printLocations : embLocations;
    const requestData: CalculatePriceParams = {
      decorationType,
      locations: [
        {
          colorCount:
            decorationType === "Screen Print" ? location1Colors : undefined,
          stitchCount:
            decorationType === "Embroidery"
              ? stitchCountToNumber(location1Stitches)
              : undefined,
        },
      ],
      productData: {
        net,
        type: productType,
      },
      quantities: quantityBreaks,
    };

    if (locationCount > 1)
      requestData.locations.push({
        colorCount:
          decorationType === "Screen Print" ? location2Colors : undefined,
        stitchCount:
          decorationType === "Embroidery"
            ? stitchCountToNumber(location2Stitches)
            : undefined,
      });
    if (locationCount > 2)
      requestData.locations.push({
        colorCount:
          decorationType === "Screen Print" ? location3Colors : undefined,
        stitchCount:
          decorationType === "Embroidery"
            ? stitchCountToNumber(location3Stitches)
            : undefined,
      });
    if (locationCount > 3)
      requestData.locations.push({
        colorCount:
          decorationType === "Screen Print" ? location4Colors : undefined,
        stitchCount:
          decorationType === "Embroidery"
            ? stitchCountToNumber(location4Stitches)
            : undefined,
      });

    return requestData;
  }

  //get the price again when any form state changes
  useEffect(() => {
    setEstimateResponse(null);
    getPriceDebounced({
      decorationType,
      embLocations,
      location1Colors,
      location1Stitches,
      location2Colors,
      location2Stitches,
      location3Colors,
      location3Stitches,
      location4Colors,
      location4Stitches,
      printLocations,
    });
  }, [
    quantity,
    decorationType,
    printLocations,
    embLocations,
    location1Colors,
    location2Colors,
    location3Colors,
    location4Colors,
    location1Stitches,
    location2Stitches,
    location3Stitches,
    location4Stitches,
  ]);

  useEffect(() => {
    if (mainRef.current) {
      requestHeightChange(mainRef.current.scrollHeight);
    }
  }, [decorationType, expandedSection, embLocations, printLocations]);

  return (
    <div className={styles["main"]} ref={mainRef}>
      <div className={styles["row"]}>
        {/* Decoration method */}

        <label htmlFor="decoration-type" className={styles["label"]}>
          Decoration Method
        </label>
        <select
          name="decoration-type"
          id="decoration-type"
          value={decorationType}
          onChange={(e) => setDecorationType(e.target.value as DecorationType)}
        >
          {allowPrint && <option value="Screen Print">Screen Print</option>}
          {allowEmbroidery && <option value="Embroidery">Embroidery</option>}
        </select>
      </div>

      {/* Quantity */}

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

      {/* Print/emb fields */}

      {decorationType === "Screen Print" && (
        <PrintFields
          printLocations={printLocations}
          setPrintLocations={setPrintLocations}
          location1Colors={location1Colors}
          location2Colors={location2Colors}
          location3Colors={location3Colors}
          location4Colors={location4Colors}
          setLocation1Colors={setLocation1Colors}
          setLocation2Colors={setLocation2Colors}
          setLocation3Colors={setLocation3Colors}
          setLocation4Colors={setLocation4Colors}
        />
      )}
      {decorationType === "Embroidery" && (
        <EmbroideryFields
          embLocations={embLocations}
          setEmbLocations={setEmbLocations}
          location1Stitches={location1Stitches}
          location2Stitches={location2Stitches}
          location3Stitches={location3Stitches}
          location4Stitches={location4Stitches}
          setLocation1Stitches={setLocation1Stitches}
          setLocation2Stitches={setLocation2Stitches}
          setLocation3Stitches={setLocation3Stitches}
          setLocation4Stitches={setLocation4Stitches}
        />
      )}

      {/* The estimate for the quantity entered by the user */}

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

      {/* Price breaks */}

      <ExpandableSection
        label="View Price Breaks"
        isExpanded={expandedSection === "price breaks"}
        onClickExpand={() =>
          setExpandedSection(
            expandedSection === "price breaks" ? null : "price breaks"
          )
        }
      >
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
      </ExpandableSection>

      {/* Decoration location graphic */}

      <ExpandableSection
        label="View Decoration Locations"
        isExpanded={expandedSection === "locations"}
        onClickExpand={() =>
          setExpandedSection(
            expandedSection === "locations" ? null : "locations"
          )
        }
      >
        <DecorationLocations />
      </ExpandableSection>

      {/* Order terms */}

      <ExpandableSection
        label="Show Order Terms"
        isExpanded={expandedSection === "terms"}
        onClickExpand={() =>
          setExpandedSection(expandedSection === "terms" ? null : "terms")
        }
      >
        <p className={styles["order-terms"]}>
          Most minimum quantities start at 48 pieces. Upcharges may apply for
          larger sizes. Pricing is an estimate only and is subject to change.
          For official pricing, contact our sales team or request a quote
          online. Shipping, tax and any applicable setup charges will be added
          to your order and can be quoted upon request.
        </p>
      </ExpandableSection>
    </div>
  );
}
