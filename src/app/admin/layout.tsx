import type { Metadata } from "next";
import "./globals.css";
import AdminNavbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import { BASE_PATH, auth } from "@/auth";
import { ToastProvider } from "@/components/ToastProvider";
import { env } from "process";

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
  const isDevelopment = env.NODE_ENV === "development";

  return (
    <>
      <AdminNavbar />
      {isDevelopment && (
        <div
          style={{
            backgroundColor: "red",
            color: "white",
            position: "absolute",
            top: "60px",
            left: "50%",
            translate: "-50% 0",
            fontSize: "1.5rem",
            padding: "5px",
          }}
        >
          =========DEVELOPMENT MODE=========
        </div>
      )}
      <div className="main-content">
        <SessionProvider basePath={BASE_PATH} session={session}>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </div>
    </>
  );
}
