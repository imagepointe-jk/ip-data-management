import stylesMain from "@/styles/customizer/CustomProductDesigner/main.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleList } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { setModalOpen, useEditorSelectors } from "../redux/slices/editor";
import { countCartItems } from "../utils/misc";
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
    <button className={stylesMain["cart-bar-button"]} onClick={onClickOpenCart}>
      <div>
        <FontAwesomeIcon icon={faRectangleList} /> Quote
      </div>
      <div>
        {productCount} item{productCount > 1 && "s"}
      </div>
    </button>
  );
}
