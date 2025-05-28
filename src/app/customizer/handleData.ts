import { getProductsMultiple } from "@/fetch/woocommerce";

export async function populateProductData<
  T extends { wooCommerceId: number; id: number }
>(settingsArr: T[]) {
  const productIds = settingsArr.map((item) => item.wooCommerceId);
  const products = await getProductsMultiple(productIds);
  const populated = settingsArr.map((item) => {
    const matchingProduct = products.find(
      (product) => product.id === item.wooCommerceId
    );
    return {
      ...item,
      product: matchingProduct,
    };
  });

  return populated;
}
