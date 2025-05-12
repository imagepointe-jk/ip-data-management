import { prisma } from "@/../prisma/client";
import { UserDataForm } from "./UserDataForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function User(props: Props) {
  const params = await props.params;
  const id = +params.id;
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser && id !== 0) return <h1>User not found.</h1>;

  return (
    <>
      <h1>{existingUser ? `User - ${existingUser.name}` : "Create User"}</h1>
      <UserDataForm existingUser={existingUser} />
    </>
  );
}
