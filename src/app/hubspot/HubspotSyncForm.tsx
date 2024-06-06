"use client";

import { startSync } from "@/actions/hubspot";
import { roundToDecimalPlaces } from "@/utility/misc";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";

type Props = {
  syncInProgress: boolean;
  progress: number;
};
type Status = "loading" | "error" | "success" | "initial";
const initialStatus: Status = "initial";

export default function HubspotSyncForm({ progress, syncInProgress }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(null as string | null);
  const [message, setMessage] = useState(null as string | null);
  const session = useSession();
  const userEmail = session.data?.user?.email;
  if (!userEmail) return <>Unexpected error.</>;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setStatus("loading");

    const formData = new FormData(e.target as HTMLFormElement);
    const { error, message } = await startSync(formData);

    if (message) setMessage(message);
    if (error) {
      console.error(`Error ${error.statusCode}`);
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  return (
    <>
      <h1>HubSpot</h1>
      {(syncInProgress || status === "success") && (
        <div>Progress: {roundToDecimalPlaces(progress, 2) * 100}%</div>
      )}
      {!syncInProgress && status !== "success" && (
        <form onSubmit={onSubmit}>
          <input type="hidden" name="userEmail" value={userEmail} />
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
          {(status === "initial" || status === "error") && (
            <button type="submit">Start Sync</button>
          )}
          {status === "loading" && <div>Uploading...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {message && <div>{message}</div>}
        </form>
      )}
    </>
  );
}
