import { getProduct } from "@/fetch/woocommerce";
import { UnwrapPromise } from "@/types/schema/misc";
import { parseWooCommerceProduct } from "@/types/validations/woo";

export async function populateProductData<
  T extends { wooCommerceId: number; id: number }
>(settingsArr: T[]) {
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
