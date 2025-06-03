import {
  getShippingMethods,
  getWebstoreWithIncludes,
} from "@/db/access/orderApproval";
import Link from "next/link";
import { EditingForm } from "./EditingForm/EditingForm";
import { ShortcodeReference } from "../../ShortcodeReference";
import fs from "fs";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const existingWebstore = await getWebstoreWithIncludes(+params.id);

  if (!existingWebstore && params.id !== "0")
    return <h1>Webstore {params.id} not found.</h1>;

  if (existingWebstore && !existingWebstore.shippingSettings)
    return <h1>Webstore shipping settings not found.</h1>;

  const shippingMethods = await getShippingMethods();
  const filenames = fs
    .readdirSync(
      path.resolve(process.cwd(), "src/order-approval/mail/shippingEmails")
    )
    .map((name) => name.replace(".hbs", ""));

  return (
    <>
      <h1>
        {existingWebstore ? "Editing Webstore Data" : "Creating Webstore Data"}
      </h1>
      {existingWebstore && <Link href={`${params.id}/users`}>View Users</Link>}
      <Link href={`${params.id}/logs`} style={{ marginLeft: "10px" }}>
        View Logs
      </Link>
      <EditingForm
        webstoreData={existingWebstore}
        shippingMethods={shippingMethods}
        shortcodeReference={<ShortcodeReference />}
        shippingEmailFilenames={filenames}
      />
    </>
  );
}
