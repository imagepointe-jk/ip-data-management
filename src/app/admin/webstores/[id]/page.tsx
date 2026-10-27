import Link from "next/link";
import { notFound } from "next/navigation";
import { getWebstore } from "@/db/access/general";
import { EditingForm } from "./EditingForm/EditingForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;
  const webstore = await getWebstore(+params.id);

  if (!webstore) notFound();

  return (
    <>
      <h1>Editing Webstore Data</h1>
      <EditingForm webstore={webstore} />
    </>
  );
}
