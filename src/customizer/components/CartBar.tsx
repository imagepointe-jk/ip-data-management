import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { useSelector } from "react-redux";
import { StoreType } from "../redux/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { setModalOpen } from "../redux/slices/editor";
import { countCartItems } from "../utils";

export function CartBar() {
  const cart = useSelector((store: StoreType) => store.cart);
  const dispatch = useDispatch();
  const productCount = countCartItems(cart.present);

  return (
    <div
      className={`${styles["floating-container"]} ${styles["cart-bar-main"]}`}
    >
      <button
        className={styles["cart-bar-button"]}
        onClick={() => dispatch(setModalOpen("cart"))}
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
