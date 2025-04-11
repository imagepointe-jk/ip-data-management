import { useEditorSelectors } from "@/customizer/redux/slices/editor";
import { CartStateProduct } from "@/types/schema/customizer";
import { CartProductVariation } from "./CartProductVariation";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";

type CartProductProps = {
  productInState: CartStateProduct;
};
export function CartProductGroup({ productInState }: CartProductProps) {
  const { allProductData } = useEditorSelectors();
  const product = allProductData.find(
    (product) => product.id === productInState.id
  );

  return (
    <div className={styles["cart-item-variations-container"]}>
      {!product && <>Invalid product.</>}
      {product &&
        productInState.variations.map((variation) => (
          <CartProductVariation
            key={variation.id}
            productData={product}
            variationInState={variation}
          />
        ))}
    </div>
  );
}
