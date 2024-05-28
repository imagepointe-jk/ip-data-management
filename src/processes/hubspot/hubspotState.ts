import {
  getAllCompanies,
  getAllContacts,
  getAllDeals,
  getAllProducts,
} from "./fetch";

export async function getHubspotState() {
  console.log("Getting existing companies...");
  const existingCompanies = await getAllCompanies();
  console.log("Getting existing contacts...");
  const existingContacts = await getAllContacts();
  console.log("Getting existing deals...");
  const existingDeals = await getAllDeals();
  console.log("Getting existing products...");
  const existingProducts = await getAllProducts();

  return {
    existingCompanies,
    existingContacts,
    existingDeals,
    existingProducts,
  };
}
