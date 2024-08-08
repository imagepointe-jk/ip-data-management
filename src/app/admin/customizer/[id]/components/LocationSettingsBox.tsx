import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import { Updater } from "use-immer";

import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";

type LocationSettingsBoxProps = {
  location: CustomProductDecorationLocationNumeric | undefined;
  totalViewLocations: number;
  selectedLocationId: number | undefined;
  selectedVariationId: number | undefined;
  selectedViewId: number | undefined;
  setSettings: Updater<FullProductSettings>;
};
export function LocationSettingsBox({
  location,
  selectedLocationId,
  selectedVariationId,
  selectedViewId,
  totalViewLocations,
  setSettings,
}: LocationSettingsBoxProps) {
  function onChangeLocationSettings(
    locationId: number,
    change: {
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
    }
  ) {
    setSettings((draft) => {
      //look for the given locationId on the currently selected view of the currently selected variation
      const location = draft.variations
        .find((variation) => variation.id === selectedVariationId)
        ?.views.find((view) => view.id === selectedViewId)
        ?.locations.find((location) => location.id === locationId);
      if (!location) return;

      const { height, positionX, positionY, width } = change;
      if (height) location.height = height;
      if (width) location.width = width;
      if (positionX) location.positionX = positionX;
      if (positionY) location.positionY = positionY;
    });
  }

  return (
    <div className={styles["location-settings-box"]}>
      <h4>
        {location
          ? `"${location.name}" Settings`
          : selectedLocationId === undefined || totalViewLocations === 0
          ? "(No Location Selected)"
          : "(Invalid Location)"}
      </h4>
      {location && (
        <>
          <div>
            Position X
            <input
              type="range"
              value={location.positionX * 100}
              onChange={(e) =>
                onChangeLocationSettings(location.id, {
                  positionX: +e.target.value / 100,
                })
              }
            />
          </div>
          <div>
            Position Y
            <input
              type="range"
              value={location.positionY * 100}
              onChange={(e) =>
                onChangeLocationSettings(location.id, {
                  positionY: +e.target.value / 100,
                })
              }
            />
          </div>
          <div>
            Width
            <input
              type="range"
              value={location.width * 100}
              onChange={(e) =>
                onChangeLocationSettings(location.id, {
                  width: +e.target.value / 100,
                })
              }
            />
          </div>
          <div>
            Height
            <input
              type="range"
              value={location.height * 100}
              onChange={(e) =>
                onChangeLocationSettings(location.id, {
                  height: +e.target.value / 100,
                })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
