"use server";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "./index";

//The NextAuth function produced signIn and signOut functions in index.ts.
//import them here and re-export them wrapped in server actions.
export async function signIn() {
  await nextAuthSignIn();
}

export async function signOut() {
  await nextAuthSignOut();
}
