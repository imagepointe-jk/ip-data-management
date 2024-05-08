import { auth } from "@/auth";
import AuthButton from "@/components/AuthButton.server";

export default async function Home() {
  const session = await auth();
  const userName = session?.user?.name;

  return (
    <div>
      <h1>Home</h1>
      <p>{userName ? `Hello ${userName}` : "You are not signed in."}</p>
      <AuthButton />
    </div>
  );
}
