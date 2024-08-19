import { deleteVariation } from "@/actions/customizer/delete";
import { FullProductSettings } from "@/db/access/customizer";
import { Color, CustomProductSettingsVariation } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { Updater } from "use-immer";

type VariationSettingsBoxProps = {
  variation: (CustomProductSettingsVariation & { color: Color }) | undefined;
  selectedVariationId: number | undefined;
  settings: FullProductSettings;
  setSettings: Updater<FullProductSettings>;
  setVariationId: Dispatch<SetStateAction<number | undefined>>;
  colors: Color[];
};
export function VariationSettingsBox({
  variation,
  selectedVariationId,
  settings,
  setVariationId,
  setSettings,
  colors,
}: VariationSettingsBoxProps) {
  async function onClickDeleteVariation() {
    if (!selectedVariationId) return;

    try {
      await deleteVariation(selectedVariationId);
      setSettings((draft) => {
        draft.variations = draft.variations.filter(
          (variation) => variation.id !== selectedVariationId
        );
      });
      const variationBeforeThis = settings.variations.find(
        (variation, i, array) => {
          const next = array[i + 1];
          if (next && next.id === selectedVariationId) return variation;
        }
      );
      setVariationId(variationBeforeThis?.id);
    } catch (error) {
      console.error(error);
    }
  }

  function onChangeColor(id: number) {
    setSettings((draft) => {
      const variation = draft.variations.find(
        (variation) => variation.id === selectedVariationId
      );
      const color = colors.find((color) => color.id === id);
      if (!variation || !color) return;

      variation.colorId = id;
      variation.color = color;
    });
  }

  return (
    <div className={styles["variation-settings-container"]}>
      <select
        value={variation?.color.id || colors[0]?.id}
        onChange={(e) => onChangeColor(+e.target.value)}
      >
        {colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.name}
          </option>
        ))}
      </select>
      <div>
        <button
          className="button-danger"
          onClick={() => onClickDeleteVariation()}
        >
          Delete Variation
        </button>
      </div>
    </div>
  );
}
