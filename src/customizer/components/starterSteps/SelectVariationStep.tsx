import styles from "@/styles/customizer/CustomProductDesigner/starterStep.module.css";
import { Card } from "./Card";
import { PopulatedProductSettings } from "@/types/dto/customizer";

type Props = {
  productData: PopulatedProductSettings[];
  clickedProductId: number;
  clickedVariationId: number | null;
  setClickedVariationId: (id: number) => void;
};
export function SelectVariationStep({
  productData,
  clickedProductId,
  clickedVariationId,
  setClickedVariationId,
}: Props) {
  const product = productData.find(
    (product) => product.wooCommerceId === clickedProductId
  );
  if (!product) return <>PRODUCT ERROR</>;

  return (
    <>
      <h1>Select a Color</h1>
      <div className={styles["cards-container"]}>
        {product.variations.map((variation) => (
          <Card
            key={variation.id}
            isSelected={clickedVariationId === variation.id}
            onClick={() => setClickedVariationId(variation.id)}
            imageSrc={variation.views[0]?.imageUrl}
            text={variation.color.name}
          />
        ))}
      </div>
    </>
  );
}
