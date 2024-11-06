import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

type Props = {
  printLocations: number;
  setPrintLocations: (value: number) => void;
  location1Colors: number;
  location2Colors: number;
  location3Colors: number;
  location4Colors: number;
  setLocation1Colors: (value: number) => void;
  setLocation2Colors: (value: number) => void;
  setLocation3Colors: (value: number) => void;
  setLocation4Colors: (value: number) => void;
};
export function PrintFields({
  printLocations,
  setPrintLocations,
  location1Colors,
  location2Colors,
  location3Colors,
  location4Colors,
  setLocation1Colors,
  setLocation2Colors,
  setLocation3Colors,
  setLocation4Colors,
}: Props) {
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
      <div className={styles["row"]}>
        <label htmlFor="print-locations" className={styles["label"]}>
          Print Locations
        </label>
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
      <div className={styles["row"]}>
        <label htmlFor="location-1-colors" className={styles["label"]}>
          Location 1 Colors
        </label>
        <select
          name="location-1-colors"
          id="location-1-colors"
          value={location1Colors}
          onChange={(e) => setLocation1Colors(+e.target.value)}
        >
          {colorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      {printLocations > 1 && (
        <div className={styles["row"]}>
          <label htmlFor="location-2-colors" className={styles["label"]}>
            Location 2 Colors
          </label>
          <select
            name="location-2-colors"
            id="location-2-colors"
            value={location2Colors}
            onChange={(e) => setLocation2Colors(+e.target.value)}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {printLocations > 2 && (
        <div className={styles["row"]}>
          <label htmlFor="location-3-colors" className={styles["label"]}>
            Location 3 Colors
          </label>
          <select
            name="location-3-colors"
            id="location-3-colors"
            value={location3Colors}
            onChange={(e) => setLocation3Colors(+e.target.value)}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      )}
      {printLocations > 3 && (
        <div className={styles["row"]}>
          <label htmlFor="location-4-colors" className={styles["label"]}>
            Location 4 Colors
          </label>
          <select
            name="location-4-colors"
            id="location-4-colors"
            value={location4Colors}
            onChange={(e) => setLocation4Colors(+e.target.value)}
          >
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
