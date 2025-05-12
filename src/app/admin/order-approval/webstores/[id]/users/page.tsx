import { getWebstoreWithIncludes } from "@/db/access/orderApproval";
import { UserResultsTable } from "./UserResultsTable";
import { CreateUser } from "./CreateUser";
import Link from "next/link";
import { RoleResultsTable } from "./RoleResultsTable";
import { Roles } from "./Roles";
import { SingleRole } from "./SingleRole";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function Page(props: Props) {
  const params = await props.params;

  const {
    id
  } = params;

  const webstore = await getWebstoreWithIncludes(+id);
  if (!webstore) return <h1>Webstore {id} not found.</h1>;

  return (
    <>
      <h1>{webstore.name} Users</h1>
      <Link href={`../${id}`}>&lt; Back to {webstore.name}</Link>
      <div>
        {/* {webstore.roles.length > 0 && <Users webstore={webstore} />} */}
        {webstore.roles.length > 0 && <UserResultsTable webstore={webstore} />}
        {webstore.roles.length === 0 && <p>No users.</p>}
        <CreateUser webstoreId={webstore.id} />
      </div>
      <div>
        <h2>Roles</h2>
        <Roles roles={webstore.roles} webstoreId={webstore.id} />
      </div>
    </>
  );
}
