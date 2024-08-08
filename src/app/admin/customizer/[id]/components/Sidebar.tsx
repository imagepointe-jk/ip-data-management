import { createVariation } from "@/actions/customizer/create";
import { FullProductSettings } from "@/db/access/customizer";
import { Dispatch, SetStateAction, useState } from "react";
import { Updater } from "use-immer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";

type SidebarProps = {
  settings: FullProductSettings;
  setSettings: Updater<FullProductSettings>;
  selectedVariationId: number | undefined;
  setVariationId: Dispatch<SetStateAction<number | undefined>>;
  setViewId: Dispatch<SetStateAction<number | undefined>>;
  setLocationId: Dispatch<SetStateAction<number | undefined>>;
};
export function Sidebar({
  settings,
  setSettings,
  selectedVariationId,
  setLocationId,
  setVariationId,
  setViewId,
}: SidebarProps) {
  const [addVariationLoading, setAddVariationLoading] = useState(false);

  async function onClickAddVariation() {
    try {
      setAddVariationLoading(true);
      const created = await createVariation(settings.id);
      setSettings((draft) => {
        draft.variations.push({
          ...created,
          views: created.views.map((view) => ({ ...view, locations: [] })),
        });
      });
    } catch (error) {
      console.error(error);
    }
    setAddVariationLoading(false);
  }

  function onClickVariation(variationId: number) {
    setVariationId(variationId);
    const firstViewId = settings.variations.find(
      (variation) => variation.id === variationId
    )?.views[0]?.id;
    setViewId(firstViewId);
    setLocationId(undefined);
  }

  return (
    <div className={styles["sidebar"]}>
      <div className={styles["variations-column"]}>
        Variations
        {settings.variations.map((variation) => (
          <button
            key={variation.id}
            onClick={() => onClickVariation(variation.id)}
            className={
              variation.id === selectedVariationId
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
  );
}
