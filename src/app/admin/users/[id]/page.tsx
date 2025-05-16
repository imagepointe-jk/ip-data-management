import { prisma } from "@/../prisma/client";
import { UserDataForm } from "./UserDataForm";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function User(props: Props) {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser) notFound();

  const loggedInUser = await prisma.user.findUnique({
    where: {
      email: `${sessionUser.email}`,
    },
  });
  if (!loggedInUser) return <h1>Unknown error.</h1>;

  const params = await props.params;
  const id = +params.id;
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser && id !== 0) return <h1>User not found.</h1>;

  if (
    existingUser &&
    existingUser.email !== loggedInUser.email &&
    loggedInUser.role !== "super"
  )
    return <h2>You don&apos;t have permission to edit this user.</h2>;

  return (
    <>
      <h1>{existingUser ? `User - ${existingUser.name}` : "Create User"}</h1>
      <UserDataForm existingUser={existingUser} />
    </>
  );
}
