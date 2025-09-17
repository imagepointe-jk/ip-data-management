import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";

type Props = {
  locations: { id: number; name: string }[];
  selectedLocationId: number | undefined;
  setSelectedLocationId: (id: number | undefined) => void;
};
export function LocationSelectorBox({
  locations,
  selectedLocationId,
  setSelectedLocationId,
}: Props) {
  return (
    <div className={styles["location-selector-box"]}>
      <h4>Select location</h4>
      <div className={styles["location-selector-scroll-container"]}>
        {locations.length === 0 && <>(No locations)</>}
        {locations.map((location) => (
          <button
            key={location.id}
            className={`${styles["location-selector-item"]} ${
              selectedLocationId === location.id ? styles["selected"] : ""
            }`}
            onClick={() => setSelectedLocationId(location.id)}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
}
