import styles from "@/styles/pricingCalculator/pricingCalculator.module.css";

export function DecorationLocations() {
  const locations = [
    "left-chest",
    "right-chest",
    "full-front",
    "full-back",
    "left-sleeve",
    "right-sleeve",
  ];

  return (
    <div className={styles["decoration-locations-container"]}>
      <div className={styles["decoration-locations-img-container"]}>
        <img src="https://www.imagepointe.com/wp-content/uploads/2024/11/garment.png" />
        {locations.map((location) => (
          <div
            key={location}
            className={`${styles["decoration-location-icon"]} ${styles[location]}`}
          >
            <div>?</div>
          </div>
        ))}
        <div
          className={`${styles["decoration-location-icon"]} ${styles["left-chest"]}`}
        >
          <div>?</div>
        </div>
      </div>
    </div>
  );
}
