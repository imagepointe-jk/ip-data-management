import { GarmentSettingListing } from "@/db/access/customizer";
import { getProduct } from "@/fetch/woocommerce";
import { WooCommerceProduct } from "@/types/schema";
import { parseWooCommerceProduct } from "@/types/validations";
import { CustomGarmentSettings } from "@prisma/client";

export async function populateGarmentData(
  settingsArr: GarmentSettingListing[]
) {
  //implement with parallel fetching
  const populated: (GarmentSettingListing & {
    product?: WooCommerceProduct;
  })[] = [];
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
        `Error populating garment settings id ${settings.id}:`,
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
