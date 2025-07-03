import {
  Color,
  CustomProductSettingsVariation,
  CustomProductView,
} from "@prisma/client";
import styles from "@/styles/customizer/CustomProductDesigner/productVariationCard.module.css";
import { IMAGE_NOT_FOUND_URL } from "@/constants";

type Props = {
  variation: CustomProductSettingsVariation & { color: Color } & {
    views: CustomProductView[];
  };
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
            imageOverride || variation.views[0]?.imageUrl || IMAGE_NOT_FOUND_URL
          }
        />{" "}
      </div>
      <div className={styles["color-label"]}>{variation.color.name}</div>
    </div>
  );
}
