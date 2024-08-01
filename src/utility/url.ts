export const rootUrl = () => {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return process.env.BASE_URL;
};
