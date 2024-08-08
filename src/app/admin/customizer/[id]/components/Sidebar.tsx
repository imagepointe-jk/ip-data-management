import { createVariation } from "@/actions/customizer/create";
import { FullProductSettings } from "@/db/access/customizer";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { Updater } from "use-immer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";

type SidebarProps = {
  settings: FullProductSettings;
  setSettings: Updater<FullProductSettings>;
  selectedVariationId: number | undefined;
  setVariationId: Dispatch<SetStateAction<number | undefined>>;
  setViewIndex: Dispatch<SetStateAction<number>>;
  setLocationId: Dispatch<SetStateAction<number | undefined>>;
};
export function Sidebar({
  settings,
  setSettings,
  selectedVariationId,
  setLocationId,
  setVariationId,
  setViewIndex,
}: SidebarProps) {
  const [addVariationLoading, setAddVariationLoading] = useState(false);
  const router = useRouter();

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

  function onClickVariation(variationId: number) {
    setVariationId(variationId);
    setViewIndex(0);
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
