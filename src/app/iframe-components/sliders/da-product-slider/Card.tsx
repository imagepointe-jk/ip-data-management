import { IframeLink } from "@/components/IframeHelper/IframeLink";
import styles from "@/styles/iframe-components/sliders/daProductSlider.module.css";

type Props = {
  card: {
    name: string;
    imageUrl: string;
    productUrl: string;
    subtext: string;
    colors: string[];
  };
};
export function Card({
  card: { name, imageUrl, productUrl, subtext, colors },
}: Props) {
  return (
    <>
      <img src={imageUrl} className={styles["image"]} />
      <div className={styles["overlay-container"]}>
        <div className={styles["product-name"]}>{name}</div>
        <div className={styles["colors-text"]}>Available Colors</div>
        <div className={styles["swatches-flex"]}>
          {colors.map((color) => (
            <div
              key={color}
              className={styles["swatch"]}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
        <IframeLink href={productUrl} className={styles["product-link"]}>
          View Product
        </IframeLink>
        <div className={styles["product-info-bar"]}>
          <div className={styles["product-info-bar-main-text"]}>{name}</div>
          <div className={styles["product-info-bar-subtext"]}>{subtext}</div>
        </div>
      </div>
    </>
  );
}
