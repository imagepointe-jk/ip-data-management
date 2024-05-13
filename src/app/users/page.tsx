import Link from "next/link";
import { prisma } from "../../../prisma/client";

export default async function Users() {
  const users = await prisma.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={`user-${user.id}`}>
          <Link href={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
      <Link href="users/0">Create User</Link>
    </ul>
  );
}
