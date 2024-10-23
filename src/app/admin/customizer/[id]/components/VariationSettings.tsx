import { deleteVariation } from "@/actions/customizer/delete";
import { FullProductSettings } from "@/db/access/customizer";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import {
  Color,
  CustomProductSettingsVariation,
  ProductSizeOptions,
} from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import { Updater } from "use-immer";

type Props = {
  selectedVariationId: number | undefined;
  setSettings: Updater<FullProductSettings>;
  variation:
    | (CustomProductSettingsVariation & {
        color: Color;
        sizeOptions: ProductSizeOptions | null;
      })
    | undefined;
  colors: Color[];
  settings: FullProductSettings;
  setVariationId: Dispatch<SetStateAction<number | undefined>>;
};
export function VariationSettings({
  variation,
  setSettings,
  selectedVariationId,
  colors,
  settings,
  setVariationId,
}: Props) {
  const fields = [
    {
      label: "S",
      defaultChecked: variation?.sizeOptions?.sizeSmall,
    },
  ];

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
    <div className={`${styles["sidebar"]} ${styles["sidebar-2"]}`}>
      <div className="vert-flex-group">
        <div>Variation Settings</div>
        <div>
          <div>Available Sizes</div>
          <div className={styles["variation-sizes"]}>
            <label>
              <input
                type="checkbox"
                onChange={(e) => console.log(e.target.checked)}
              />
              S
            </label>
            <label>
              <input type="checkbox" />M
            </label>
            <label>
              <input type="checkbox" />L
            </label>
            <label>
              <input type="checkbox" />
              XL
            </label>
            <label>
              <input type="checkbox" />
              2XL
            </label>
            <label>
              <input type="checkbox" />
              3XL
            </label>
            <label>
              <input type="checkbox" />
              4XL
            </label>
            <label>
              <input type="checkbox" />
              5XL
            </label>
            <label>
              <input type="checkbox" />
              6XL
            </label>
          </div>
        </div>
        <div>
          <div>Color</div>
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
        </div>
        <div>
          <button
            className="button-danger"
            onClick={() => onClickDeleteVariation()}
          >
            Delete Variation
          </button>
        </div>
      </div>
    </div>
  );
}
