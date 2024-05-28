import {
  getAllCompanies,
  getAllContacts,
  getAllDeals,
  getAllProducts,
} from "./fetch";

export async function getHubspotState() {
  const existingCompanies = await getAllCompanies();
  const existingContacts = await getAllContacts();
  const existingDeals = await getAllDeals();
  const existingProducts = await getAllProducts();

  return {
    existingCompanies,
    existingContacts,
    existingDeals,
    existingProducts,
  };
}
