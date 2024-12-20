//make TS treat all as defined, but immediately check the values at runtime
export const env = {
  IP_WP_APPLICATION_USERNAME: process.env.IP_WP_APPLICATION_USERNAME!,
  IP_WP_APPLICATION_PASSWORD: process.env.IP_WP_APPLICATION_PASSWORD!,
  QUOTE_REQUEST_DEST_EMAIL: process.env.QUOTE_REQUEST_DEST_EMAIL!,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing envioronment variable "${key}"!`);
  }
}
