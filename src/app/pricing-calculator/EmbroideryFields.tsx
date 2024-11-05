import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";
import { StitchCount } from "./PricingCalculator";

type Props = {
  embLocations: number;
  setEmbLocations: (value: number) => void;
  location1Stitches: StitchCount;
  location2Stitches: StitchCount;
  location3Stitches: StitchCount;
  location4Stitches: StitchCount;
  setLocation1Stitches: (count: StitchCount) => void;
  setLocation2Stitches: (count: StitchCount) => void;
  setLocation3Stitches: (count: StitchCount) => void;
  setLocation4Stitches: (count: StitchCount) => void;
};
export function EmbroideryFields({
  embLocations,
  setEmbLocations,
  location1Stitches,
  location2Stitches,
  location3Stitches,
  location4Stitches,
  setLocation1Stitches,
  setLocation2Stitches,
  setLocation3Stitches,
  setLocation4Stitches,
}: Props) {
  const stitchOptions = [
    {
      value: "0k",
      text: "Up to 5k stitches",
    },
    {
      value: "5k",
      text: "5k-10k stitches",
    },
    {
      value: "10k",
      text: "10k-15k stitches",
    },
    {
      value: "15k",
      text: "15k-20k stitches",
    },
  ];

  return (
    <>
      <div className={styles["row"]}>
        <label htmlFor="emb-locations" className={styles["label"]}>
          Embroidery Locations
        </label>
        <select
          name="emb-locations"
          id="emb-locations"
          value={`${embLocations}`}
          onChange={(e) => setEmbLocations(+e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <div className={styles["row"]}>
        <label htmlFor="location-1-stitches" className={styles["label"]}>
          Location 1 Stitches
        </label>
        <select
          name="location-1-stitches"
          id="location-1-stitches"
          value={location1Stitches}
          onChange={(e) => setLocation1Stitches(e.target.value as StitchCount)}
        >
          {stitchOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      {embLocations > 1 && (
        <div className={styles["row"]}>
          <label htmlFor="location-2-stitches" className={styles["label"]}>
            Location 2 Stitches
          </label>
          <select
            name="location-2-stitches"
            id="location-2-stitches"
            value={location2Stitches}
            onChange={(e) =>
              setLocation2Stitches(e.target.value as StitchCount)
            }
          >
            {stitchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {embLocations > 2 && (
        <div className={styles["row"]}>
          <label htmlFor="location-3-stitches" className={styles["label"]}>
            Location 3 Stitches
          </label>
          <select
            name="location-3-stitches"
            id="location-3-stitches"
            value={location3Stitches}
            onChange={(e) =>
              setLocation3Stitches(e.target.value as StitchCount)
            }
          >
            {stitchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {embLocations > 3 && (
        <div className={styles["row"]}>
          <label htmlFor="location-4-stitches" className={styles["label"]}>
            Location 4 Stitches
          </label>
          <select
            name="location-4-stitches"
            id="location-4-stitches"
            value={location4Stitches}
            onChange={(e) =>
              setLocation4Stitches(e.target.value as StitchCount)
            }
          >
            {stitchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
