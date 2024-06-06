//return key-value pairs where the value is the Impress value and the key is the exact property name expected by HubSpot API

import { Contact, Customer, LineItem, Order, Product } from "@/types/schema";

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

export function mapOrderToDeal(order: Order) {
  return {
    order_type: order["Sales Order Type"],
    dealname: order["Sales Order#"],
    createdate: order["Entered Date"]?.toISOString(),
    order_due_date: order["Request Date"]?.toISOString(),
    ship_by: order["Cancel Date"]?.toISOString(),
    description: order["Customer PO#"],
    hubspot_owner_id: order["HubSpot Owner ID"],
    entered_by: order.Purchaser,
    shipping_cost: order["Shipping $Cost"],
    sales_tax: order["Tax $Total"],
    order_total: order["Order $Total"],
    cost_of_goods: order["Order $Cost"],
    commission: order["Commission Amount"],
    closedate: order["Invoice Date"]?.toISOString(),
    sales_order_internal_comments: order["Internal Comments"],
    sales_order_external_comments: order.Comments,
    ship_via: order["Ship Via"],
    garment_design: order["Garment Design"],
    garment_design_description: order["Garment Design Description"],
    garment_design_instructions: order["Garment Design Instructions"],
    pipeline: order.Pipeline,
    dealstage: order["Deal Stage"],
    po_: order["PO#"],
  };
}

export function mapProductToProduct(product: Product) {
  return {
    name: product.Name,
    hs_sku: product.SKU,
    price: product["Unit Price"],
    hs_product_type: product["Product Type"]?.toLocaleLowerCase(),
  };
}

export function mapLineItemToLineItem(lineItem: LineItem) {
  return {
    createdate: lineItem["Entered Date"],
    description: lineItem.Size,
    quantity: lineItem["Size Qty Ordered"],
    hs_cost_of_goods_sold: lineItem["Size Cost"],
    price: lineItem["Unit Price"],
    hs_sku: lineItem["SKU#"],
    name: lineItem.Name,
  };
}
