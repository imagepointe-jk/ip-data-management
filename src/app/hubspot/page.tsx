import { startSync } from "@/actions/hubspot";

export default async function Hubspot() {
  return (
    <>
      <h1>HubSpot</h1>
      <form action={startSync}>
        <div>
          <label htmlFor="customers">Customers: </label>
          <input type="file" name="customers" id="customers" />
        </div>
        <div>
          <label htmlFor="contacts">Contacts: </label>
          <input type="file" name="contacts" id="contacts" />
        </div>
        <div>
          <label htmlFor="orders">Orders: </label>
          <input type="file" name="orders" id="orders" />
        </div>
        <div>
          <label htmlFor="po">PO: </label>
          <input type="file" name="po" id="po" />
        </div>
        <div>
          <label htmlFor="products">Products: </label>
          <input type="file" name="products" id="products" />
        </div>
        <div>
          <label htmlFor="lineItems">Line Items: </label>
          <input type="file" name="lineItems" id="lineItems" />
        </div>
        <button type="submit">Start Sync</button>
      </form>
    </>
  );
}
