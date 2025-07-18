import { useEditorSelectors } from "@/customizer/redux/slices/editor";
import { StoreType } from "@/customizer/redux/store";
import { findVariationInCart } from "@/customizer/utils/find";
import styles from "@/styles/customizer/CustomProductDesigner/copyDesign.module.css";
import { useSelector } from "react-redux";
import { ProductVariationCard } from "../ProductVariationCard";

type Props = {
  highlightIds: number[];
  shouldDisableVariation: (id: number) => boolean;
  createDisabledMessage: (id: number) => string;
  onClickVariation: (id: number) => void;
};
export function VariationSelector({
  highlightIds,
  shouldDisableVariation,
  createDisabledMessage,
  onClickVariation,
}: Props) {
  const { selectedProductData } = useEditorSelectors();
  const cart = useSelector((store: StoreType) => store.cart.present);

  return (
    <div className={styles["scroll-container"]}>
      {selectedProductData.variations.map((variation) => {
        const variationInCart = findVariationInCart(cart, variation.id);
        const disabled = shouldDisableVariation(variation.id);

        return (
          <ProductVariationCard
            key={variation.id}
            variation={variation}
            disabled={disabled}
            highlighted={highlightIds.includes(variation.id)}
            title={disabled ? createDisabledMessage(variation.id) : undefined}
            onClick={() => onClickVariation(variation.id)}
            imageOverride={variationInCart?.views[0]?.currentRenderUrl}
          />
        );
      })}
    </div>
  );
}
