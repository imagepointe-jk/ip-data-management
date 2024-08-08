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
  const [viewId, setViewId] = useState(
    initialSettings.variations[0]?.views[0]?.id || undefined
  );
  const [locationId, setLocationId] = useState(
    initialSettings.variations[0]?.views[0]?.locations[0]?.id || undefined
  );
  const [saving, setSaving] = useState(false);
  const errors: string[] = [];

  const variation = settings.variations.find(
    (variation) => variation.id === variationId
  );
  if (!variation) errors.push(`Variation id ${variationId} not found.`);

  const view = variation?.views.find((view) => view.id === viewId);
  if (!view)
    errors.push(`View id ${viewId} of variation id ${variationId} not found.`);

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
      const view = draft.variations
        .find((variation) => variation.id === variationId)
        ?.views.find((view) => view.id === viewId);
      if (!view) return;
      view.imageUrl = url;
    });
  }

  function onChangeViewName(name: string) {
    setSettings((draft) => {
      const view = draft.variations
        .find((variation) => variation.id === variationId)
        ?.views.find((view) => view.id === viewId);
      if (!view) return;
      view.name = name;
    });
  }

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    const variation = settings.variations.find(
      (variation) => variation.id === variationId
    );
    setViewId(variation?.views[0]?.id);
  }, [variationId]);

  useEffect(() => {
    setLocationId(undefined);
  }, [viewId]);

  return (
    <div className={styles["main-flex"]}>
      <Sidebar
        selectedVariationId={variationId}
        setLocationId={setLocationId}
        setSettings={setSettings}
        setVariationId={setVariationId}
        setViewId={setViewId}
        settings={settings}
      />
      <div className={styles["editor-area"]}>
        <VariationSettingsBox
          selectedVariationId={variationId}
          setVariationId={setVariationId}
          settings={settings}
          setSettings={setSettings}
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
          selectedViewId={viewId}
          setViewId={setViewId}
          views={variation?.views || []}
        />

        <ProductView
          setViewId={setViewId}
          setLocationId={setLocationId}
          selectedView={view}
          views={variation?.views || []}
          selectedVariationId={variationId}
          setSettings={setSettings}
        />

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
          setSelectedLocationId={setLocationId}
          selectedVariationId={variationId}
          selectedViewId={viewId}
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
