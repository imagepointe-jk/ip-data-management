import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

type Props = {
  embLocations: number;
  setEmbLocations: (value: number) => void;
};
export function EmbroideryFields({ embLocations, setEmbLocations }: Props) {
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
      <div className={styles["input-container"]}>
        <label htmlFor="emb-locations">Embroidery Locations</label>
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
      <div className={styles["input-container"]}>
        <label htmlFor="location-1-stitches">Location 1 Stitches</label>
        <select name="location-1-stitches" id="location-1-stitches">
          {stitchOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      {embLocations > 1 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-2-stitches">Location 2 Stitches</label>
          <select name="location-2-stitches" id="location-2-stitches">
            {stitchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {embLocations > 2 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-3-stitches">Location 3 Stitches</label>
          <select name="location-3-stitches" id="location-3-stitches">
            {stitchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {embLocations > 3 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-4-stitches">Location 4 Stitches</label>
          <select name="location-4-stitches" id="location-4-stitches">
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
