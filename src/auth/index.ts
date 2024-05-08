import NextAuth, { User, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "../../prisma/client";

export const BASE_PATH = "/api/auth";

//define options for initializing NextAuth.
const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "jsmith" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        //this is where you would check the password.
        //not implemented yet.
        const user = await prisma.user.findUnique({
          where: {
            email: `${credentials.email}`,
          },
        });
        return user
          ? { id: `${user.id}`, name: user.name, email: user.email }
          : null;
      },
    }),
  ],
  basePath: BASE_PATH,
  secret: process.env.NEXTAUTH_SECRET,
};

//initialize NextAuth using the above options, pull out what it makes,
//and make them available elsewhere.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
