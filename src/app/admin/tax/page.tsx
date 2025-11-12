import { ExportForm } from "./ExportForm";
import { UploadForm } from "./UploadForm";

export default function Page() {
  return (
    <>
      <h1>WooCommerce Tax Tools</h1>
      <h2>Tax Import</h2>
      <UploadForm />
      <h2>Tax Export</h2>
      <p>
        Exports tax data via API so we can include some columns that the default
        exporter does not.
      </p>
      <ExportForm />
    </>
  );
}
