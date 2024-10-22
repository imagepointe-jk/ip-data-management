export const envServer = {
  IP_WP_APPLICATION_USERNAME: process.env.IP_WP_APPLICATION_USERNAME,
  IP_WP_APPLICATION_PASSWORD: process.env.IP_WP_APPLICATION_PASSWORD,
};

for (const [key, value] of Object.entries(envServer)) {
  if (value === undefined) {
    throw new Error(`Missing envioronment variable "${key}"!`);
  }
}
