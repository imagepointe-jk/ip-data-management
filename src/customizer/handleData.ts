import { getProductSettings } from "@/db/access/customizer";
import { getProduct } from "@/fetch/woocommerce";
import { UnwrapPromise } from "@/types/types";
import { parseWooCommerceProduct } from "@/types/validations/woo";

export async function populateProductData(
  settingsArr: UnwrapPromise<ReturnType<typeof getProductSettings>>
) {
  //implement with parallel fetching
  const populated = [];
  for (const settings of settingsArr) {
    try {
      const response = await getProduct(settings.wooCommerceId);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          `Response ${response.status}, json ${JSON.stringify(json)}`
        );
      }
      const parsed = parseWooCommerceProduct(json);
      populated.push({
        ...settings,
        product: parsed,
      });
    } catch (error) {
      console.error(
        `Error populating product settings id ${settings.id}:`,
        error
      );
      populated.push({
        ...settings,
        product: undefined,
      });
    }
  }

  return populated;
}
