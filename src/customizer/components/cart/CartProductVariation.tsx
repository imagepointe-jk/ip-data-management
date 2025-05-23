import {
  CartStateProductVariation,
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
                <RenderedProductView
                  key={view.id}
                  bgImgUrl={viewData?.imageUrl || ""}
                  view={view}
                />
              );
            })}
          </div>
          <div>
            <div
              className={styles["cart-item-name"]}
            >{`${wooCommerceProductData.name} (${variationData.color.name})`}</div>
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
  const dispatch = useDispatch();
  const { quantities } = variationInState;
  const dbVariation = productData.variations.find(
    (variation) => variation.id === variationInState.id
  );
  const fields = [
    {
      size: "s",
      label: "Small",
      value: quantities.s,
      createNewQuantities: (value: number) => ({ s: value }),
      available: dbVariation?.sizeOptions.sizeSmall,
    },
    {
      size: "m",
      label: "Medium",
      value: quantities.m,
      createNewQuantities: (value: number) => ({ m: value }),
      available: dbVariation?.sizeOptions.sizeMedium,
    },
    {
      size: "l",
      label: "Large",
      value: quantities.l,
      createNewQuantities: (value: number) => ({ l: value }),
      available: dbVariation?.sizeOptions.sizeLarge,
    },
    {
      size: "xl",
      label: "XL",
      value: quantities.xl,
      createNewQuantities: (value: number) => ({ xl: value }),
      available: dbVariation?.sizeOptions.sizeXL,
    },
    {
      size: "2xl",
      label: "2XL",
      value: quantities["2xl"],
      createNewQuantities: (value: number) => ({ ["2xl"]: value }),
      available: dbVariation?.sizeOptions.size2XL,
    },
    {
      size: "3xl",
      label: "3XL",
      value: quantities["3xl"],
      createNewQuantities: (value: number) => ({ ["3xl"]: value }),
      available: dbVariation?.sizeOptions.size3XL,
    },
    {
      size: "4xl",
      label: "4XL",
      value: quantities["4xl"],
      createNewQuantities: (value: number) => ({ ["4xl"]: value }),
      available: dbVariation?.sizeOptions.size4XL,
    },
    {
      size: "5xl",
      label: "5XL",
      value: quantities["5xl"],
      createNewQuantities: (value: number) => ({ ["5xl"]: value }),
      available: dbVariation?.sizeOptions.size5XL,
    },
    {
      size: "6xl",
      label: "6XL",
      value: quantities["6xl"],
      createNewQuantities: (value: number) => ({ ["6xl"]: value }),
      available: dbVariation?.sizeOptions.size6XL,
    },
  ].filter((field) => field.available);

  return (
    <div className={styles["cart-item-form"]}>
      {fields.map((field) => (
        <div key={field.size}>
          <label
            htmlFor={`${variationInState.id}-size-${field.size}`}
            className={styles["input-label"]}
          >
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
