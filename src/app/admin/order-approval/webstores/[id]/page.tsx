import {
  getShippingMethods,
  getWebstoreWithIncludes,
} from "@/db/access/orderApproval";
import Link from "next/link";
import { EditingForm } from "./EditingForm/EditingForm";
import { ShortcodeReference } from "../../ShortcodeReference";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const webstore = await getWebstoreWithIncludes(+params.id);

  if (!webstore || !webstore.shippingSettings) notFound();

  const shippingMethods = await getShippingMethods();
  const filenames = fs
    .readdirSync(
      path.resolve(process.cwd(), "src/order-approval/mail/shippingEmails")
    )
    .map((name) => name.replace(".hbs", ""));

  return (
    <>
      <h1>Editing Webstore Data</h1>
      {webstore && <Link href={`${params.id}/users`}>View Users</Link>}
      <Link href={`${params.id}/logs`} style={{ marginLeft: "10px" }}>
        View Logs
      </Link>
      <EditingForm
        webstoreData={webstore}
        shippingMethods={shippingMethods}
        shortcodeReference={<ShortcodeReference />}
        shippingEmailFilenames={filenames}
      />
    </>
  );
}
