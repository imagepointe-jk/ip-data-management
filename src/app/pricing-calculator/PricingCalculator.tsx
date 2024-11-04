import { useState } from "react";
import { useProduct } from "./WCProductProvider";
import { DecorationType } from "@/types/schema/pricing";
import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";
import { PrintFields } from "./PrintFields";
import { EmbroideryFields } from "./EmbroideryFields";

export function PricingCalculator() {
  const [quantity, setQuantity] = useState(100);
  const [printLocations, setPrintLocations] = useState(1);
  const [embLocations, setEmbLocations] = useState(1);
  const [decorationType, setDecorationType] = useState(
    "Embroidery" as DecorationType
  );
  const {
    productData: { net },
  } = useProduct();

  return (
    <div className={styles["main"]}>
      <div className={styles["input-container"]}>
        <label htmlFor="decoration-type">Decoration Method</label>
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
      <div className={styles["input-container"]}>
        <label htmlFor="quantity">Quantity</label>
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
    </div>
  );
}
