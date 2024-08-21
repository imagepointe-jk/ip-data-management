import type { Metadata } from "next";
import "./globals.css";
import AdminNavbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { BASE_PATH, auth } from "@/auth";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Image Pointe Data Management",
  description: "A hub for managing various IP data.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <>
      <AdminNavbar />
      <SessionProvider basePath={BASE_PATH} session={session}>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </>
  );
}
