import {
  FullProductSettings,
  getFullProductSettings,
} from "@/db/access/customizer";
import ProductSettingsEditor from "./ProductSettingsEditor";
import { getProduct } from "@/fetch/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations/woo";
import { getColors } from "@/db/access/misc";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function ProductSettings(props: Props) {
  const params = await props.params;
  const id = +params.id;
  if (isNaN(id)) return <h1>Invalid ID.</h1>;
  const existingSettings = await getFullProductSettings(id);

  if (!existingSettings) return <h1>Settings not found.</h1>;
  const product = await getProductBySettings(existingSettings);
  const colors = await getColors();

  return (
    <>
      <h1 style={{ marginBottom: "0" }}>
        {product ? product.name : "(Product not found)"}
      </h1>
      <div style={{ marginTop: "0", marginBottom: "20px" }}>
        {product?.sku || "(Unknown SKU)"}
      </div>
      <ProductSettingsEditor settings={existingSettings} colors={colors} />
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
