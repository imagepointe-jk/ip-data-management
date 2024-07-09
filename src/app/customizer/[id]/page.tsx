import {
  FullGarmentSettings,
  getFullGarmentSettings,
} from "@/db/access/customizer";
import GarmentSettingsEditor from "./GarmentSettingsEditor";
import { getProduct } from "@/fetch/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations";

type Props = {
  params: {
    id: string;
  };
};
export default async function GarmentSettings({ params }: Props) {
  const id = +params.id;
  const existingSettings = await getFullGarmentSettings(id);

  if (!existingSettings) return <h1>Settings not found.</h1>;
  const product = await getGarmentProduct(existingSettings);

  return (
    <>
      <h1>{product ? product.name : "(Product not found)"}</h1>
      <div>WooCommerce product ID: {product ? product.id : "(not found)"}</div>
      <div>Status: {existingSettings.published ? "Published" : "Draft"}</div>
      <GarmentSettingsEditor settings={existingSettings} />
    </>
  );
}

async function getGarmentProduct(garmentSettings: FullGarmentSettings) {
  try {
    const productResponse = await getProduct(garmentSettings.wooCommerceId);
    const productJson = await productResponse.json();
    return parseWooCommerceProduct(productJson);
  } catch (error) {
    return undefined;
  }
}
