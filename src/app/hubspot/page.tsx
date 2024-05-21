"use client";

import { startSync } from "@/actions/hubspot";
import { FormEvent, useState } from "react";

export default function Hubspot() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [message, setMessage] = useState(null as string | null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const { error, message } = await startSync(formData);

    setLoading(false);
    if (message) setMessage(message);
    if (error) {
      console.error(`Error ${error.statusCode}`);
      setError(error.message);
    }
  }

  return (
    <>
      <h1>HubSpot</h1>
      <form onSubmit={onSubmit}>
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
        {!loading && <button type="submit">Start Sync</button>}
        {loading && <div>Uploading...</div>}
        {!loading && error && <div style={{ color: "red" }}>{error}</div>}
        {message && <div>{message}</div>}
      </form>
    </>
  );
}
