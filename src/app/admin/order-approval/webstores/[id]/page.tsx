import { createWebstore, updateWebstore } from "@/actions/orderWorkflow";
import { getWebstoreById } from "@/db/access/orderApproval";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};
export default async function Page({ params }: Props) {
  const existingWebstore = await getWebstoreById(+params.id);

  if (!existingWebstore && params.id !== "0")
    return <h1>Webstore {params.id} not found.</h1>;

  return (
    <>
      <h1>
        {existingWebstore ? "Editing Webstore Data" : "Creating Webstore Data"}
      </h1>
      {existingWebstore && <Link href={`${params.id}/users`}>View Users</Link>}
      <form action={existingWebstore ? updateWebstore : createWebstore}>
        <h2>
          Name{" "}
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={existingWebstore?.name}
            required
          />
        </h2>
        <div>
          Organization Name{" "}
          <input
            type="text"
            name="org-name"
            id="org-name"
            defaultValue={existingWebstore?.organizationName}
            required
          />
        </div>
        <div>
          URL{" "}
          <input
            type="text"
            name="url"
            id="url"
            defaultValue={existingWebstore?.url}
            required
          />
        </div>
        <div>
          {existingWebstore ? "Change API Key " : "Set API Key "}{" "}
          <input
            type="text"
            name="api-key"
            id="api-key"
            required={!existingWebstore}
          />
        </div>
        <div>
          {existingWebstore ? "Change API Secret " : "Set API Secret "}
          <input
            type="text"
            name="api-secret"
            id="api-secret"
            required={!existingWebstore}
          />
        </div>
        <input type="hidden" name="id" value={existingWebstore?.id} readOnly />
        <button type="submit">
          {existingWebstore ? "Save Changes" : "Create Webstore"}
        </button>
      </form>
    </>
  );
}
