import { PopulatedProductSettings } from "@/types/schema/customizer";
import { Card } from "./Card";
import styles from "@/styles/customizer/CustomProductDesigner/starterStep.module.css";

type Props = {
  productData: PopulatedProductSettings[];
  clickedProductId: number | null;
  setClickedProductId: (id: number) => void;
};
export function SelectProductStep({
  productData,
  clickedProductId,
  setClickedProductId,
}: Props) {
  return (
    <>
      <h1>Select a Product</h1>
      <div className={styles["cards-container"]}>
        {productData.map((product) => (
          <Card
            key={product.id}
            isSelected={clickedProductId === product.wooCommerceId}
            onClick={() => setClickedProductId(product.wooCommerceId)}
            imageSrc={product.variations[0]?.views[0]?.imageUrl}
            text={product.product?.name}
          />
        ))}
      </div>
    </>
  );
}
