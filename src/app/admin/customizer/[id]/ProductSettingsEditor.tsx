"use client";

import { FullProductSettings } from "@/db/access/customizer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { LocationSettingsBox } from "./components/LocationSettingsBox";
import { ProductView } from "./components/ProductView";
import { SaveArea } from "./components/SaveArea";
import { Sidebar } from "./components/Sidebar";
import { VariationSettingsBox } from "./components/VariationSettingsBox";
import { ViewArrows } from "./components/ViewArrows";

type Props = {
  settings: FullProductSettings;
};
export default function ProductSettingsEditor({
  settings: initialSettings,
}: Props) {
  const [settings, setSettings] = useImmer(initialSettings);
  const [variationId, setVariationId] = useState(
    initialSettings.variations[0]?.id || undefined
  );
  const [viewIndex, setViewIndex] = useState(0);
  const [locationId, setLocationId] = useState(
    initialSettings.variations[0]?.views[0]?.locations[0]?.id || undefined
  );
  const [saving, setSaving] = useState(false);
  const errors: string[] = [];

  const variation = settings.variations.find(
    (variation) => variation.id === variationId
  );
  if (!variation) errors.push(`Variation id ${variationId} not found.`);

  const view = variation?.views[viewIndex];
  if (!view)
    errors.push(
      `View index ${viewIndex} of variation id ${variationId} not found.`
    );

  const location = view?.locations.find(
    (location) => location.id === locationId
  );
  if (
    locationId !== undefined &&
    !location &&
    view &&
    view.locations.length > 0
  )
    errors.push(`Invalid location id ${locationId} selected.`);

  function onChangeImageUrl(url: string) {
    setSettings((draft) => {
      const view = draft.variations.find(
        (variation) => variation.id === variationId
      )?.views[viewIndex];
      if (!view) return;
      view.imageUrl = url;
    });
  }

  function onChangeViewName(name: string) {
    setSettings((draft) => {
      const view = draft.variations.find(
        (variation) => variation.id === variationId
      )?.views[viewIndex];
      if (!view) return;
      view.name = name;
    });
  }

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return (
    <div className={styles["main-flex"]}>
      <Sidebar
        selectedVariationId={variationId}
        setLocationId={setLocationId}
        setSettings={setSettings}
        setVariationId={setVariationId}
        setViewIndex={setViewIndex}
        settings={settings}
      />
      <div className={styles["editor-area"]}>
        <VariationSettingsBox
          selectedVariationId={variationId}
          setVariationId={setVariationId}
          settings={settings}
          variation={variation}
        />

        {/* View Name */}

        <input
          type="text"
          className={styles["view-name"]}
          placeholder="Name this view..."
          value={view?.name || ""}
          onChange={(e) => onChangeViewName(e.target.value)}
        />

        <ViewArrows
          selectedViewIndex={viewIndex}
          setViewIndex={setViewIndex}
          views={variation?.views || []}
        />

        <ProductView setLocationId={setLocationId} view={view} />

        <div className={styles["image-url-container"]}>
          Image URL
          <input
            type="text"
            placeholder="www.example.com"
            value={view?.imageUrl || ""}
            onChange={(e) => onChangeImageUrl(e.target.value)}
          />
        </div>

        <LocationSettingsBox
          location={location}
          selectedLocationId={locationId}
          selectedVariationId={variationId}
          selectedViewIndex={viewIndex}
          setSettings={setSettings}
          totalViewLocations={view?.locations.length || 0}
        />

        <SaveArea
          errors={errors}
          saving={saving}
          setSaving={setSaving}
          settingsState={settings}
        />
      </div>
    </div>
  );
}
