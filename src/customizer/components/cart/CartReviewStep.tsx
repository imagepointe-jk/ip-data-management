import { StoreType } from "@/customizer/redux/store";
import { useSelector } from "react-redux";
import styles from "@/styles/customizer/CustomProductDesigner/cart.module.css";
import { CartProductGroup } from "./CartProductGroup";

type Props = {
  onClickContinue: () => void;
};
export function CartReviewStep({ onClickContinue }: Props) {
  const cart = useSelector((store: StoreType) => store.cart);

  return (
    <>
      <h2>My Cart</h2>
      <div className={styles["cart-items-container"]}>
        {cart.present.products.map((item) => (
          <CartProductGroup key={item.id} productInState={item} />
        ))}
      </div>
      <div className={styles["step-buttons-container"]}>
        <button onClick={onClickContinue}>Continue</button>
      </div>
    </>
  );
}
