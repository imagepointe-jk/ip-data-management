import {
  CartStateProductVariation,
  PopulatedProductSettingsSerializable,
} from "@/types/schema/customizer";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import stylesForm from "@/styles/customizer/CustomProductDesigner/forms.module.css";
import { RenderedProductView } from "../RenderedProductView";
import { useDispatch } from "react-redux";
import {
  changeProductVariationQuantities,
  removeProductVariation,
} from "@/customizer/redux/slices/cart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { countCartItems } from "@/customizer/utils/misc";
import { useSelector } from "react-redux";
import { StoreType } from "@/customizer/redux/store";
import {
  setModalOpen,
  setSelectedVariationId,
  setSelectedViewId,
  useEditorSelectors,
} from "@/customizer/redux/slices/editor";

type Props = {
  productData: PopulatedProductSettingsSerializable;
  variationInState: CartStateProductVariation;
};
export function CartProductVariation({ variationInState, productData }: Props) {
  const variationData = productData.variations.find(
    (variation) => variation.id === variationInState.id
  );
  const cart = useSelector((store: StoreType) => store.cart.present);
  const { selectedVariation } = useEditorSelectors();
  const dispatch = useDispatch();
  const wooCommerceProductData = productData.product;
  const totalItems = countCartItems(cart);

  function onClickEdit() {
    if (!variationData) throw new Error("No variation data");

    const firstView = variationData.views[0];
    if (!firstView) throw new Error("No views");

    dispatch(setSelectedVariationId(variationData.id));
    dispatch(setSelectedViewId(firstView.id));
    dispatch(setModalOpen(null));
  }

  function onClickDelete() {
    if (!variationData) throw new Error("No variation data");

    if (selectedVariation.id === variationData.id) {
      //if the variation we're trying to delete is also the one currently selected, switch to any other variation first to prevent errors
      const otherVariation = productData.variations.filter(
        (variation) => variation.id !== variationData.id
      )[0];
      if (!otherVariation) throw new Error("No other variation to switch to");

      const firstView = otherVariation.views[0];
      if (!firstView) throw new Error("No views");

      dispatch(setSelectedVariationId(otherVariation.id));
      dispatch(setSelectedViewId(firstView.id));
    }

    dispatch(
      removeProductVariation({
        targetProductId: productData.id,
        variationId: variationData.id,
      })
    );
  }

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
            <div className={styles["cart-item-name-row"]}>
              <div>{`${wooCommerceProductData.name} (${variationData.color.name})`}</div>
              <div className={styles["cart-item-buttons"]}>
                <button onClick={onClickEdit}>
                  <FontAwesomeIcon icon={faPencil} />
                  Edit
                </button>
                {totalItems > 1 && (
                  <button className="button-danger" onClick={onClickDelete}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Delete
                  </button>
                )}
              </div>
            </div>
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
            className={stylesForm["input-label"]}
          >
            {field.label}
          </label>
          <input
            type="number"
            className={stylesForm["form-input"]}
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
