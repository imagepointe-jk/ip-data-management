"use client";

import { signIn, signOut } from "@/auth/helpers";
import { useSession } from "next-auth/react";

export default function AuthButton() {
  //only used here for getting the email to display in the sign out button.
  const session = useSession();

  async function clickSignIn() {
    await signIn();
  }

  async function clickSignOut() {
    await signOut();
    await signIn();
  }

  return session.data?.user ? (
    <button onClick={clickSignOut} className="button-beta">
      Sign Out {session.data.user.email}
    </button>
  ) : (
    <button onClick={clickSignIn}>Sign In</button>
  );
}
