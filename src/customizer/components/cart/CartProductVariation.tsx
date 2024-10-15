import {
  CartStateProductVariation,
  CartStateProductView,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { RenderedProductView } from "../RenderedProductView";

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
          <div className={styles["cart-item-views-container"]}>
            {variationInState.views.map((view) => {
              const viewData = variationData.views.find(
                (viewData) => viewData.id === view.id
              );
              return (
                <CartProductVariationView
                  key={view.id}
                  viewInState={view}
                  viewData={viewData}
                />
              );
            })}
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

type CartProductVariationViewProps = {
  viewInState: CartStateProductView;
  viewData?: {
    name: string;
    imageUrl: string;
  };
};
function CartProductVariationView({
  viewInState,
  viewData,
}: CartProductVariationViewProps) {
  return (
    <RenderedProductView
      bgImgUrl={viewData?.imageUrl || ""}
      view={viewInState}
      renderScale={0.3}
    />
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
