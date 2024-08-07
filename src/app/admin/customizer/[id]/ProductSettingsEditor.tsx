"use client";

import { createVariation } from "@/actions/customizer/create";
import { deleteVariation } from "@/actions/customizer/delete";
import { updateProductSettings } from "@/actions/customizer/update";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { createLocationFrameInlineStyles } from "@/customizer/editor";
import { FullProductSettings } from "@/db/access/customizer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { wrap } from "@/utility/misc";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";

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
  const [addVariationLoading, setAddVariationLoading] = useState(false);
  const errors: string[] = [];
  const router = useRouter();

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

  function onClickVariation(variationId: number) {
    setVariationId(variationId);
    setViewIndex(0);
    setLocationId(undefined);
  }

  function onClickViewArrow(direction: "left" | "right") {
    const views = variation?.views;
    if (!views) return;

    let newViewIndex = direction === "left" ? viewIndex - 1 : viewIndex + 1;
    newViewIndex = wrap(newViewIndex, 0, views.length - 1);

    setViewIndex(newViewIndex);
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
        .find((variation) => variation.id === variationId)
        ?.views[viewIndex]?.locations.find(
          (location) => location.id === locationId
        );
      if (!location) return;

      const { height, positionX, positionY, width } = change;
      if (height) location.height = height;
      if (width) location.width = width;
      if (positionX) location.positionX = positionX;
      if (positionY) location.positionY = positionY;
    });
  }

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

  async function onClickAddVariation() {
    try {
      setAddVariationLoading(true);
      await createVariation(settings.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
    setAddVariationLoading(false);
  }

  async function onClickDeleteVariation() {
    if (!variationId) return;

    try {
      await deleteVariation(variationId);
      const variationBeforeThis = settings.variations.find(
        (variation, i, array) => {
          const next = array[i + 1];
          if (next && next.id === variationId) return variation;
        }
      );
      setVariationId(variationBeforeThis?.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  async function onClickSave() {
    if (saving) return;

    try {
      setSaving(true);
      await updateProductSettings(settings);
      setSaving(false);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return (
    <div className={styles["main-flex"]}>
      <div className={styles["sidebar"]}>
        <div className={styles["variations-column"]}>
          Variations
          {settings.variations.map((variation) => (
            <button
              key={variation.id}
              onClick={() => onClickVariation(variation.id)}
              className={
                variation.id === variationId
                  ? styles["variation-selected"]
                  : undefined
              }
            >
              {variation.color.name}
            </button>
          ))}
          <ButtonWithLoading
            className={styles["add-variation"]}
            normalText="+"
            onClick={() => onClickAddVariation()}
            loading={addVariationLoading}
          />
        </div>
        <div>
          <select
            value={settings.published ? "published" : "draft"}
            onChange={(e) =>
              setSettings({
                ...settings,
                published: e.target.value === "published",
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      <div className={styles["editor-area"]}>
        {/* Variation Settings */}

        <div className={styles["variation-settings-container"]}>
          <span
            className={styles["variation-swatch"]}
            style={{
              backgroundColor: `#${variation?.color.hexCode || "ffffff"}`,
            }}
          ></span>{" "}
          Variation Color
          <div>
            <button
              className="button-danger"
              onClick={() => onClickDeleteVariation()}
            >
              Delete Variation
            </button>
          </div>
        </div>

        {/* View Name */}

        <input
          type="text"
          className={styles["view-name"]}
          placeholder="Name this view..."
          value={view?.name || ""}
          onChange={(e) => onChangeViewName(e.target.value)}
        />

        {/* View Arrows */}

        <div className={styles["view-arrows-container"]}>
          <button
            className={`${styles["view-arrow"]} ${styles["view-arrow-left"]}`}
            onClick={() => onClickViewArrow("left")}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className={`${styles["view-arrow"]} ${styles["view-arrow-right"]}`}
            onClick={() => onClickViewArrow("right")}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {/* View Image */}

        <div className={styles["product-view-frame"]}>
          <img
            src={view?.imageUrl || IMAGE_NOT_FOUND_URL}
            className={styles["product-view-img"]}
          />
          {view &&
            view.locations.map((location) => (
              <div
                key={location.id}
                className={styles["location-frame"]}
                style={createLocationFrameInlineStyles({
                  width: `${location.width}`,
                  height: `${location.height}`,
                  positionX: `${location.positionX}`,
                  positionY: `${location.positionY}`,
                })}
                onClick={() => setLocationId(location.id)}
              >
                <div className={styles["location-name"]}>{location.name}</div>
              </div>
            ))}
        </div>

        {/* Image URL */}

        <div className={styles["image-url-container"]}>
          Image URL
          <input
            type="text"
            placeholder="www.example.com"
            value={view?.imageUrl || ""}
            onChange={(e) => onChangeImageUrl(e.target.value)}
          />
        </div>

        {/* Location Settings */}

        <div className={styles["location-settings-box"]}>
          <h4>
            {location
              ? `"${location.name}" Settings`
              : locationId === undefined ||
                (view && view.locations.length === 0)
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

        {/* Errors & Save */}

        <div className={styles["save-container"]}>
          {errors.length > 0 && (
            <div className={styles["error"]}>
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <ButtonWithLoading
            normalText="Save Changes"
            className={styles["save"]}
            loading={saving}
            onClick={() => onClickSave()}
          />
        </div>
      </div>
    </div>
  );
}
