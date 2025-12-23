import { PopulatedProductSettings } from "@/types/dto/customizer";
import { Card } from "./Card";
import styles from "@/styles/customizer/CustomProductDesigner/starterStep.module.css";
import { useEffect } from "react";

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
  useEffect(() => {
    const element = document.getElementById(`product-${clickedProductId}`);
    if (!element) return;
    element.scrollIntoView({
      behavior: "smooth",
    });
  }, [clickedProductId]);

  return (
    <>
      <h1>Select a Product</h1>
      <div className={styles["cards-container"]}>
        {productData.map((product) => (
          <Card
            key={product.id}
            id={`product-${product.wooCommerceId}`}
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
