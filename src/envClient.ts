//make TS treat all as defined, but immediately check the values at runtime
//exclude server-only variables to prevent errors
export const env = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
};

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Missing envioronment variable "${key}"!`);
  }
}
