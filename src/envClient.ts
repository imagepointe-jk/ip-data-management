//make TS treat all as defined, but immediately check the values at runtime
//exclude server-only variables to prevent errors
export const env = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  NEXT_PUBLIC_GOOGLE_FONTS_API_KEY:
    process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY!, //google requires us to send the key in the URL, so we might as well make this public
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing envioronment variable "${key}"!`);
  }
}
