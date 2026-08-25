import { WooCommerceProduct } from "@/types/schema/woocommerce";

export function getProductQuantity(
  sku: string,
  products: WooCommerceProduct[],
) {
  for (const product of products) {
    if (product.sku.toLocaleLowerCase() === sku.toLocaleLowerCase())
      return product.stock_quantity || 0;

    for (const variation of product.variations) {
      if (sku.toLocaleLowerCase() === variation.sku?.toLocaleLowerCase())
        return variation.stock_quantity || 0;
    }
  }

  return 0;
}
