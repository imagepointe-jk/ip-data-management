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
        sizeOptions: ProductSizeOptions;
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
      defaultChecked: variation?.sizeOptions.sizeSmall,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.sizeSmall = state;
      },
    },
    {
      label: "M",
      defaultChecked: variation?.sizeOptions.sizeMedium,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.sizeMedium = state;
      },
    },
    {
      label: "L",
      defaultChecked: variation?.sizeOptions.sizeLarge,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.sizeLarge = state;
      },
    },
    {
      label: "XL",
      defaultChecked: variation?.sizeOptions.sizeXL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.sizeXL = state;
      },
    },
    {
      label: "2XL",
      defaultChecked: variation?.sizeOptions.size2XL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.size2XL = state;
      },
    },
    {
      label: "3XL",
      defaultChecked: variation?.sizeOptions.size3XL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.size3XL = state;
      },
    },
    {
      label: "4XL",
      defaultChecked: variation?.sizeOptions.size4XL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.size4XL = state;
      },
    },
    {
      label: "5XL",
      defaultChecked: variation?.sizeOptions.size5XL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.size5XL = state;
      },
    },
    {
      label: "6XL",
      defaultChecked: variation?.sizeOptions.size6XL,
      updateOptionsFn: (state: boolean, options: ProductSizeOptions) => {
        options.size6XL = state;
      },
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

  function onChangeSizeOption(
    state: boolean,
    updateOptionsFn: (state: boolean, options: ProductSizeOptions) => void
  ) {
    setSettings((draft) => {
      const variation = draft.variations.find(
        (variation) => variation.id === selectedVariationId
      );
      if (variation) updateOptionsFn(state, variation.sizeOptions);
    });
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

  function onChangeOrder(value: number) {
    setSettings((draft) => {
      const variation = draft.variations.find(
        (variation) => variation.id === selectedVariationId
      );
      if (variation) variation.order = value;
    });
  }

  return (
    <div className={`${styles["sidebar"]} ${styles["sidebar-2"]}`}>
      <div className="vert-flex-group">
        <div>Variation Settings</div>
        <div>
          <div>Available Sizes</div>
          <div className={styles["variation-sizes"]}>
            {variation &&
              fields.map((field) => (
                <label key={`${variation.id}-${field.label}`}>
                  <input
                    type="checkbox"
                    defaultChecked={field.defaultChecked}
                    onChange={(e) =>
                      onChangeSizeOption(
                        e.target.checked,
                        field.updateOptionsFn
                      )
                    }
                  />
                  {field.label}
                </label>
              ))}
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
          <div>Order</div>
          <input
            type="number"
            value={variation?.order}
            onChange={(e) => onChangeOrder(+e.target.value)}
          />
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
