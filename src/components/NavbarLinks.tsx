"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks() {
  const path = usePathname();

  return (
    <>
      <li>
        <Link href="/admin" className={path === "/admin" ? "current" : ""}>
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/admin/users"
          className={path === "/admin/users" ? "current" : ""}
        >
          Users
        </Link>
      </li>
      <li>
        <Link
          href="/admin/designs"
          className={path === "/admin/designs" ? "current" : ""}
        >
          Designs
        </Link>
      </li>
      <li>
        <Link
          href="/admin/hubspot"
          className={path === "/admin/hubspot" ? "current" : ""}
        >
          HubSpot
        </Link>
      </li>
      <li>
        <Link
          href="/admin/customizer"
          className={path === "/admin/customizer" ? "current" : ""}
        >
          Customizer
        </Link>
      </li>
    </>
  );
}
