import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { PopulatedProductSettings } from "@/types/schema/customizer";

type Props = {
  showSelectedProduct: boolean;
  allowContinue: boolean;
  allowBack: boolean;
  productData: PopulatedProductSettings[];
  clickedProductId: number | null;
  isFinishStep: boolean;
  onClickContinue: () => void;
  onClickBack: () => void;
};
export function StepButtons({
  allowBack,
  allowContinue,
  showSelectedProduct,
  clickedProductId,
  productData,
  isFinishStep,
  onClickContinue,
  onClickBack,
}: Props) {
  return (
    <div>
      <div className={styles["starter-step-buttons-message"]}>
        {showSelectedProduct && clickedProductId !== null && (
          <>
            You selected:{" "}
            <strong>
              {productData.find(
                (product) => product.wooCommerceId === clickedProductId
              )?.product?.name || "NAME ERROR"}
            </strong>
          </>
        )}
      </div>
      <div className={styles["starter-step-buttons-container"]}>
        <button onClick={onClickBack} disabled={!allowBack}>
          Back
        </button>
        <button onClick={onClickContinue} disabled={!allowContinue}>
          {isFinishStep ? "Let's Go!" : "Continue"}
        </button>
      </div>
    </div>
  );
}
