import { useProduct } from "./WCProductProvider";

export function PricingCalculator() {
  const {
    productData: { net },
  } = useProduct();

  return <h1>The test value is {net}</h1>;
}
