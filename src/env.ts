//make TS treat all as defined, but immediately check the values at runtime
export const env = {
  IP_WP_APPLICATION_USERNAME: process.env.IP_WP_APPLICATION_USERNAME!,
  IP_WP_APPLICATION_PASSWORD: process.env.IP_WP_APPLICATION_PASSWORD!,
  QUOTE_REQUEST_DEST_EMAIL: process.env.QUOTE_REQUEST_DEST_EMAIL!,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  REDIS_DA_PRODUCT_SYNC_CACHE_KEY: process.env.REDIS_DA_PRODUCT_SYNC_CACHE_KEY!,
  DA_WP_APPLICATION_USERNAME: process.env.DA_WP_APPLICATION_USERNAME!,
  DA_WP_APPLICATION_PASSWORD: process.env.DA_WP_APPLICATION_PASSWORD!,
  DA_WOOCOMMERCE_STORE_URL: process.env.DA_WOOCOMMERCE_STORE_URL!,
  DA_PRODUCT_SYNC_NOTIFICATION_EMAIL:
    process.env.DA_PRODUCT_SYNC_NOTIFICATION_EMAIL!,
  DEVELOPER_EMAIL: process.env.DEVELOPER_EMAIL!,
  IP_WOOCOMMERCE_STORE_URL: process.env.IP_WOOCOMMERCE_STORE_URL!,
  IP_SHIPPING_EMAIL: process.env.IP_SHIPPING_EMAIL!,
  IP_PRODUCT_SYNC_NOTIFICATION_EMAIL:
    process.env.IP_PRODUCT_SYNC_NOTIFICATION_EMAIL!,
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing envioronment variable "${key}"!`);
  }
}
