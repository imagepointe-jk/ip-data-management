import { getProductSettings } from "@/db/access/customizer";
import ResultsTable from "./ResultsTable";
import { populateProductData } from "@/app/customizer/handleData";

export default async function Customizer() {
  const productSettings = await getProductSettings();
  const populatedProducts = await populateProductData(productSettings);

  return (
    <>
      <h1>Customizable Products</h1>
      <ResultsTable productListings={populatedProducts} />
    </>
  );
}
