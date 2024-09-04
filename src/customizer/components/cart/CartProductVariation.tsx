import {
  CartStateProductVariation,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";

type Props = {
  productData: PopulatedProductSettingsSerializable;
  variationInState: CartStateProductVariation;
};
export function CartProductVariation({ variationInState, productData }: Props) {
  const variationData = productData.variations.find(
    (variation) => variation.id === variationInState.id
  );
  const wooCommerceProductData = productData.product;

  return (
    <div className={styles["cart-item-flex"]}>
      {!variationData || (!wooCommerceProductData && <>Product error.</>)}
      {variationData && wooCommerceProductData && (
        <>
          <div className={styles["cart-item-img-container"]}>
            <img
              className={styles["cart-item-img"]}
              src={variationData.views[0]?.imageUrl}
              alt=""
            />
          </div>
          <div>
            {`${wooCommerceProductData.name} (${variationData.color.name})`}
            <CartProductVariationForm
              productData={productData}
              variationInState={variationInState}
            />
          </div>
        </>
      )}
    </div>
  );
}

type CartProductVariationFormProps = {
  productData: PopulatedProductSettingsSerializable;
  variationInState: CartStateProductVariation;
};
function CartProductVariationForm({
  productData,
  variationInState,
}: CartProductVariationFormProps) {
  return (
    <div className={styles["cart-item-form"]}>
      <div>
        <label htmlFor={`${variationInState.id}-size-s`}>Small</label>
        <input type="number" id={`${variationInState.id}-size-s`} />
      </div>
      <div>
        <label htmlFor={`${variationInState.id}-size-m`}>Medium</label>
        <input type="number" id={`${variationInState.id}-size-m`} />
      </div>
      <div>
        <label htmlFor={`${variationInState.id}-size-l`}>Large</label>
        <input type="number" id={`${variationInState.id}-size-l`} />
      </div>
      <div>
        <label htmlFor={`${variationInState.id}-size-xl`}>XL</label>
        <input type="number" id={`${variationInState.id}-size-xl`} />
      </div>
    </div>
  );
}
