import { getGarmentSettings } from "@/db/access/customizer";
import ResultsTable from "./ResultsTable";
import { populateGarmentData } from "@/customizer/handleData";

export default async function Customizer() {
  const garmentSettings = await getGarmentSettings();
  const populatedGarments = await populateGarmentData(garmentSettings);

  return <ResultsTable garmentSettings={populatedGarments} />;
}
