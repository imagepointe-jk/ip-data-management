import { getDASearches } from "@/db/access/tracking";
import { ExportForm } from "./ExportForm";

export default async function Page() {
  const searches = await getDASearches();

  return (
    <>
      <h1>Tracking</h1>
      <h2>Dignity Apparel Search Terms</h2>
      <div>{searches.length} total searches have been recorded.</div>
      <ExportForm />
    </>
  );
}
