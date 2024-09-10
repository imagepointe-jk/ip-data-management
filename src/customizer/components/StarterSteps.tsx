import styles from "@/styles/customizer/CustomProductDesigner.module.css";
import { PopulatedProductSettings } from "@/types/schema/customizer";
import { useEffect, useState } from "react";
import { SelectProductStep } from "./starterSteps/SelectProductStep";
import { SelectVariationStep } from "./starterSteps/SelectVariationStep";
import { StepButtons } from "./starterSteps/StepButtons";
import { WelcomeStep } from "./starterSteps/WelcomeStep";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  productData: PopulatedProductSettings[];
  initialProductId: number | null;
  onCompleteSteps: (chosenProductId: number, chosenVariationId: number) => void;
};
export function StarterSteps({
  productData,
  initialProductId,
  onCompleteSteps,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = 4;
  const welcomeStep = stepIndex === 0;
  const productStep = stepIndex === 1;
  const variationStep = stepIndex === 2;
  const finishStep = stepIndex === 3;
  const [clickedProductId, setClickedProductId] = useState(
    null as number | null
  );
  const [clickedVariationId, setClickedVariationId] = useState(
    null as number | null
  );

  const allowContinue =
    welcomeStep ||
    finishStep ||
    (productStep && clickedProductId !== null) ||
    (variationStep && clickedVariationId !== null);

  useEffect(() => {
    setClickedProductId(initialProductId);
  }, [initialProductId]);

  function onClickContinue() {
    if (!allowContinue) return;
    if (stepIndex < totalSteps) setStepIndex(stepIndex + 1);
    if (finishStep && clickedProductId !== null && clickedVariationId !== null)
      onCompleteSteps(clickedProductId, clickedVariationId);
  }

  function onClickBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function onClickSkip() {
    const productId = clickedProductId || productData[0]?.wooCommerceId;
    if (!productId) {
      console.error("Can't skip because no valid product ID could be found!");
      return;
    }

    const variationId =
      clickedVariationId ||
      productData.find((product) => product.wooCommerceId === productId)
        ?.variations[0]?.id;
    if (!variationId) {
      console.error("Can't skip because no valid variation ID could be found!");
      return;
    }

    onCompleteSteps(productId, variationId);
  }

  return (
    <div className={styles["main"]}>
      <div className={styles["starter-step-progress-container"]}>
        <div
          className={styles["starter-step-progress-bar"]}
          style={{ right: `${100 - ((stepIndex + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className={styles["starter-step-main"]}>
        {welcomeStep && <WelcomeStep />}
        {productStep && (
          <SelectProductStep
            productData={productData}
            clickedProductId={clickedProductId}
            setClickedProductId={setClickedProductId}
          />
        )}
        {variationStep && clickedProductId !== null && (
          <SelectVariationStep
            productData={productData}
            clickedVariationId={clickedVariationId}
            setClickedVariationId={setClickedVariationId}
            clickedProductId={clickedProductId}
          />
        )}
        {finishStep && <h1>Time to start designing!</h1>}
        <StepButtons
          allowBack={stepIndex > 0}
          allowContinue={allowContinue}
          clickedProductId={clickedProductId}
          isFinishStep={finishStep}
          onClickBack={onClickBack}
          onClickContinue={onClickContinue}
          productData={productData}
          showSelectedProduct={productStep}
        />
      </div>
      <button
        className={styles["starter-step-skip-button"]}
        onClick={onClickSkip}
      >
        <div>Skip Intro</div> <FontAwesomeIcon icon={faXmark} size="2x" />
      </button>
    </div>
  );
}
