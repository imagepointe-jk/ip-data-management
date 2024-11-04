import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

type Props = {
  printLocations: number;
  setPrintLocations: (value: number) => void;
};
export function PrintFields({ printLocations, setPrintLocations }: Props) {
  const colorOptions = [
    {
      value: "1",
      text: "One Color",
    },
    {
      value: "2",
      text: "Two Color",
    },
    {
      value: "3",
      text: "Multicolor",
    },
  ];

  return (
    <>
      <div className={styles["input-container"]}>
        <label htmlFor="print-locations">Print Locations</label>
        <select
          name="print-locations"
          id="print-locations"
          onChange={(e) => setPrintLocations(+e.target.value)}
          value={`${printLocations}`}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <div className={styles["input-container"]}>
        <label htmlFor="location-1-colors">Location 1 Colors</label>
        <select name="location-1-colors" id="location-1-colors">
          {colorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      {printLocations > 1 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-2-colors">Location 2 Colors</label>
          <select name="location-2-colors" id="location-2-colors">
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {printLocations > 2 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-3-colors">Location 3 Colors</label>
          <select name="location-3-colors" id="location-3-colors">
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {printLocations > 3 && (
        <div className={styles["input-container"]}>
          <label htmlFor="location-4-colors">Location 4 Colors</label>
          <select name="location-4-colors" id="location-4-colors">
            {colorOptions.map((option) => (
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
