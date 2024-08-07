import {
  FullProductSettings,
  getFullProductSettings,
} from "@/db/access/customizer";
import ProductSettingsEditor from "./ProductSettingsEditor";
import { getProduct } from "@/fetch/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations";

type Props = {
  params: {
    id: string;
  };
};
export default async function ProductSettings({ params }: Props) {
  const id = +params.id;
  if (isNaN(id)) return <h1>Invalid ID.</h1>;
  const existingSettings = await getFullProductSettings(id);

  if (!existingSettings) return <h1>Settings not found.</h1>;
  const product = await getProductBySettings(existingSettings);

  return (
    <>
      <h1>{product ? product.name : "(Product not found)"}</h1>
      <div>WooCommerce product ID: {product ? product.id : "(not found)"}</div>
      <ProductSettingsEditor settings={existingSettings} />
    </>
  );
}

async function getProductBySettings(productSettings: FullProductSettings) {
  try {
    const productResponse = await getProduct(productSettings.wooCommerceId);
    const productJson = await productResponse.json();
    return parseWooCommerceProduct(productJson);
  } catch (error) {
    return undefined;
  }
}
