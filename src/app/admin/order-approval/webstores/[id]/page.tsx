import { updateWebstore } from "@/actions/orderWorkflow";
import { getWebstoreById } from "@/db/access/orderApproval";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params }: Props) {
  const webstore = await getWebstoreById(+params.id);

  if (!webstore) return <h1>Webstore {params.id} not found.</h1>;

  return (
    <>
      <h1>Editing Webstore Data</h1>
      <Link href={`${params.id}/users`}>View Users</Link>
      <form action={updateWebstore}>
        <h2>
          Name{" "}
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={webstore.name}
          />
        </h2>
        <div>
          Organization Name{" "}
          <input
            type="text"
            name="org-name"
            id="org-name"
            defaultValue={webstore.organizationName}
          />
        </div>
        <div>
          URL{" "}
          <input type="text" name="url" id="url" defaultValue={webstore.url} />
        </div>
        <div>
          Change API Key <input type="text" name="api-key" id="api-key" />
        </div>
        <div>
          Change API Secret{" "}
          <input type="text" name="api-secret" id="api-secret" />
        </div>
        <input type="hidden" name="id" value={webstore.id} readOnly />
        <button type="submit">Save Changes</button>
      </form>
    </>
  );
}
