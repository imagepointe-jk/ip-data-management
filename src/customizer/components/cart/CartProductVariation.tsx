import {
  CartStateProductVariation,
  CartStateProductView,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { RenderedProductView } from "../RenderedProductView";
import { useDispatch } from "react-redux";
import { changeProductVariationQuantities } from "@/customizer/redux/slices/cart";

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
  const dispatch = useDispatch();
  const { quantities } = variationInState;
  const fields = [
    {
      size: "s",
      label: "Small",
      value: quantities.s,
      createNewQuantities: (value: number) => ({ s: value }),
    },
    {
      size: "m",
      label: "Medium",
      value: quantities.m,
      createNewQuantities: (value: number) => ({ m: value }),
    },
    {
      size: "l",
      label: "Large",
      value: quantities.l,
      createNewQuantities: (value: number) => ({ l: value }),
    },
    {
      size: "xl",
      label: "XL",
      value: quantities.xl,
      createNewQuantities: (value: number) => ({ xl: value }),
    },
  ];

  return (
    <div className={styles["cart-item-form"]}>
      {fields.map((field) => (
        <div key={field.size}>
          <label htmlFor={`${variationInState.id}-size-${field.size}`}>
            {field.label}
          </label>
          <input
            type="number"
            id={`${variationInState.id}-size-${field.size}`}
            value={field.value}
            onChange={(e) =>
              dispatch(
                changeProductVariationQuantities({
                  targetVariationId: variationInState.id,
                  newQuantities: field.createNewQuantities(+e.target.value),
                })
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
