import { getGarmentSettings } from "@/db/access/customizer";
import ResultsTable from "./ResultsTable";

export default async function Customizer() {
  const garmentSettings = await getGarmentSettings();

  return <ResultsTable garmentSettings={garmentSettings} />;
}
