import {
  CustomProductDecorationLocationNumeric,
  FullProductSettings,
} from "@/db/access/customizer";
import { Updater } from "use-immer";

import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { Dispatch, SetStateAction, useState } from "react";
import { createLocation } from "@/actions/customizer/create";
import { deleteLocation } from "@/actions/customizer/delete";

type LocationSettingsBoxProps = {
  location: CustomProductDecorationLocationNumeric | undefined;
  totalViewLocations: number;
  selectedLocationId: number | undefined;
  setSelectedLocationId: Dispatch<SetStateAction<number | undefined>>;
  selectedVariationId: number | undefined;
  selectedViewId: number | undefined;
  setSettings: Updater<FullProductSettings>;
};
export function LocationSettingsBox({
  location,
  selectedLocationId,
  setSelectedLocationId,
  selectedVariationId,
  selectedViewId,
  totalViewLocations,
  setSettings,
}: LocationSettingsBoxProps) {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isDeletingLocation, setIsDeletingLocation] = useState(false);
  const [copiedLocationData, setCopiedLocationData] = useState(
    null as CustomProductDecorationLocationNumeric | null
  );

  async function onClickAddLocation() {
    if (selectedViewId === undefined) return;
    setIsAddingLocation(true);

    try {
      const created = await createLocation(selectedViewId);
      setSettings((draft) => {
        const view = draft.variations
          .find((variation) => variation.id === selectedVariationId)
          ?.views.find((view) => view.id === selectedViewId);
        if (view) view.locations.push(created);
      });
      setSelectedLocationId(created.id);
    } catch (error) {
      console.error(error);
    }

    setIsAddingLocation(false);
  }

  async function onClickDeleteLocation() {
    if (selectedLocationId === undefined) return;
    setIsDeletingLocation(true);

    try {
      await deleteLocation(selectedLocationId);
      setSettings((draft) => {
        const view = draft.variations
          .find((variation) => variation.id === selectedVariationId)
          ?.views.find((view) => view.id === selectedViewId);
        if (view)
          view.locations = view.locations.filter(
            (location) => location.id !== selectedLocationId
          );
      });
      setSelectedLocationId(undefined);
    } catch (error) {
      console.error(error);
    }

    setIsDeletingLocation(false);
  }

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

  function onChangeLocationName(name: string) {
    setSettings((draft) => {
      const location = draft.variations
        .find((variation) => variation.id === selectedVariationId)
        ?.views.find((view) => view.id === selectedViewId)
        ?.locations.find((location) => location.id === selectedLocationId);

      if (location) location.name = name;
    });
  }

  function onClickPasteLocationData() {
    if (!copiedLocationData) return;

    setSettings((draft) => {
      const { positionX, positionY, width, height } = copiedLocationData;
      const location = draft.variations
        .find((variation) => variation.id === selectedVariationId)
        ?.views.find((view) => view.id === selectedViewId)
        ?.locations.find((location) => location.id === selectedLocationId);

      if (!location) return;

      location.width = width;
      location.height = height;
      location.positionX = positionX;
      location.positionY = positionY;
    });
  }

  return (
    <div className={styles["location-settings-box"]}>
      <h4>
        {location
          ? "Location Settings"
          : selectedLocationId === undefined || totalViewLocations === 0
          ? "(No Location Selected)"
          : "(Invalid Location)"}
      </h4>
      {location && (
        <>
          <div>
            Name
            <input
              type="text"
              value={location.name}
              className={styles["location-settings-name"]}
              onChange={(e) => onChangeLocationName(e.target.value)}
            />
          </div>
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
      <div className={styles["location-extras-container"]}>
        {location && (
          <>
            <button onClick={() => setCopiedLocationData(location)}>
              Copy
            </button>
            <button onClick={onClickPasteLocationData}>Paste</button>
          </>
        )}
        <ButtonWithLoading
          loading={isAddingLocation}
          normalText="+ Add"
          onClick={() => onClickAddLocation()}
        />
        <ButtonWithLoading
          loading={isDeletingLocation}
          normalText="Delete"
          onClick={() => onClickDeleteLocation()}
          className="button-danger"
        />
      </div>
    </div>
  );
}
