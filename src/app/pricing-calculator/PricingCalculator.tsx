import { useProduct } from "./WCProductProvider";

export function PricingCalculator() {
  const {
    productData: { base_price },
  } = useProduct();

  return <h1>The test value is {base_price}</h1>;
}
