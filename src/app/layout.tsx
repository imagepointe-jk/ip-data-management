import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { BASE_PATH, auth } from "@/auth";
//setup fontawesome; this appears to prevent the initial icon size change that occurs on page load
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Pointe Data Management",
  description: "A hub for managing various IP data.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <SessionProvider basePath={BASE_PATH} session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
