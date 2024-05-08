import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div>
      <h1>Dashboard Placeholder</h1>
      <p>User: {session?.user?.name}</p>
    </div>
  );
}
