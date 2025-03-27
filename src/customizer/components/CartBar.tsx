import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import stylesMain from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { setModalOpen, useEditorSelectors } from "../redux/slices/editor";
import { countCartItems } from "../utils";
import { useEditor } from "../EditorProvider";

export function CartBar() {
  const cart = useSelector((store: StoreType) => store.cart);
  const dispatch = useDispatch();
  const productCount = countCartItems(cart.present);
  const { selectedView } = useEditorSelectors();
  const { updateViewRender } = useEditor();

  function onClickOpenCart() {
    updateViewRender(selectedView.id);
    dispatch(setModalOpen("cart"));
  }

  return (
    <div
      className={`${stylesMain["floating-container"]} ${stylesMain["cart-bar-main"]}`}
    >
      <button
        className={stylesMain["cart-bar-button"]}
        onClick={onClickOpenCart}
      >
        <div>
          <FontAwesomeIcon icon={faCartShopping} /> Cart
        </div>
        <div>
          {productCount} item{productCount > 1 && "s"}
        </div>
      </button>
    </div>
  );
}
