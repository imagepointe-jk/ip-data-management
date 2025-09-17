import styles from "@/styles/customizer/CustomProductDesigner/productVariationCard.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { findVariationInCart } from "../utils/find";
import { VariationDTO } from "@/types/dto/customizer";

type Props = {
  variation: VariationDTO;
  disabled?: boolean;
  title?: string;
  highlighted?: boolean;
  onClick?: () => void;
  imageOverride?: string;
};
export function ProductVariationCard({
  variation,
  disabled,
  title,
  onClick,
  highlighted,
  imageOverride,
}: Props) {
  const cart = useSelector((store: StoreType) => store.cart.present);
  const variationInState = findVariationInCart(cart, variation.id);
  const firstView = variationInState?.views[0];

  function onClicked() {
    if (!disabled && onClick) onClick();
  }

  return (
    <div
      className={`${styles["card"]} ${disabled ? styles["disabled"] : ""} ${
        highlighted ? styles["highlighted"] : ""
      }`}
      title={title}
      onClick={onClicked}
    >
      <div className={styles["img-container"]}>
        <img
          src={
            imageOverride ||
            firstView?.currentRenderUrl ||
            variation.views[0]?.imageUrl ||
            IMAGE_NOT_FOUND_URL
          }
        />{" "}
      </div>
      <div className={styles["color-label"]}>{variation.color.name}</div>
    </div>
  );
}
