import {
  getShippingMethods,
  getWebstoreWithIncludes,
} from "@/db/access/orderApproval";
import Link from "next/link";
import { EditingForm } from "./EditingForm";
import { ShortcodeReference } from "../../ShortcodeReference";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params }: Props) {
  const existingWebstore = await getWebstoreWithIncludes(+params.id);

  if (!existingWebstore && params.id !== "0")
    return <h1>Webstore {params.id} not found.</h1>;

  if (existingWebstore && !existingWebstore.shippingSettings)
    return <h1>Webstore shipping settings not found.</h1>;

  const shippingMethods = await getShippingMethods();

  return (
    <>
      <h1>
        {existingWebstore ? "Editing Webstore Data" : "Creating Webstore Data"}
      </h1>
      {existingWebstore && <Link href={`${params.id}/users`}>View Users</Link>}
      <EditingForm
        existingWebstore={existingWebstore}
        shippingMethods={shippingMethods}
        shortcodeReference={<ShortcodeReference />}
      />
    </>
  );
}
