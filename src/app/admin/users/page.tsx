import Link from "next/link";
import { prisma } from "@/../prisma/client";

export default async function Users() {
  const users = await prisma.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={`user-${user.id}`}>
          <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
      <Link href="/admin/users/0" className="link-as-button">
        Create User
      </Link>
    </ul>
  );
}
