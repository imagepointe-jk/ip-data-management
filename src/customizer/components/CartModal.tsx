import { Modal } from "@/components/Modal";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import {
  CartStateProduct,
  CartStateProductVariation,
} from "@/types/schema/customizer";
import { setModalOpen, useEditorSelectors } from "../redux/slices/editor";
import { useDispatch } from "react-redux";
import { FullProductSettingsSerializable } from "../redux/slices/productData";

export function CartModal() {
  const cart = useSelector((store: StoreType) => store.cart);
  const dispatch = useDispatch();

  return (
    <Modal
      windowClassName={styles["cart-modal"]}
      xButtonClassName={styles["cart-x"]}
      bgStyle={{ position: "sticky", height: "100%" }}
      onClickClose={() => dispatch(setModalOpen(null))}
    >
      <div>
        {cart.present.products.map((item) => (
          <CartProductGroup key={item.id} productInState={item} />
        ))}
      </div>
    </Modal>
  );
}

type CartProductProps = {
  productInState: CartStateProduct;
};
function CartProductGroup({ productInState }: CartProductProps) {
  const { allProductData } = useEditorSelectors();
  const product = allProductData.find(
    (product) => product.id === productInState.id
  );

  return (
    <div>
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

type CartProductVariationProps = {
  productData: FullProductSettingsSerializable;
  variationInState: CartStateProductVariation;
};
function CartProductVariation({
  variationInState,
  productData,
}: CartProductVariationProps) {
  const variationData = productData.variations.find(
    (variation) => variation.id === variationInState.id
  );

  return (
    <div>
      Product Name
      <div className={styles["cart-item-img-container"]}>
        <img
          className={styles["cart-item-img"]}
          src={variationData?.views[0]?.imageUrl}
          alt=""
        />
      </div>
    </div>
  );
}
