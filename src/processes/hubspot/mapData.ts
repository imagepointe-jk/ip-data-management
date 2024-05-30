//return key-value pairs where the value is the Impress value and the key is the exact property name expected by HubSpot API

import { Contact, Customer } from "@/types/schema";

export function mapCustomerToCompany(customer: Customer) {
  return {
    address: customer["Street Address"],
    address2: customer["Address Line 2"],
    agent_code: customer["Agent #1"],
    city: customer.City,
    country: customer.Country,
    customer_number: customer["Customer Number"],
    name: customer["Customer Name"],
    phone: customer["Phone#"],
    state: customer.State,
    zip: customer["Zip Code"],
  };
}

export function mapContactToContact(contact: Contact) {
  return {
    address: contact["Address Line 2"],
    address_code: contact["Address Code"],
    city: contact.City,
    country: contact.Country,
    email: contact.Email,
    firstname: contact.Name,
    phone: contact["Phone#"],
    state: contact.State,
    zip: contact["Zip Code"],
    fax: contact["Fax#"],
  };
}
