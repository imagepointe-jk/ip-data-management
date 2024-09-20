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
          className={path.startsWith("/admin/users") ? "current" : ""}
        >
          Users
        </Link>
      </li>
      <li>
        <Link
          href="/admin/designs"
          className={path.startsWith("/admin/designs") ? "current" : ""}
        >
          Designs
        </Link>
      </li>
      <li>
        <Link
          href="/admin/hubspot"
          className={path.startsWith("/admin/hubspot") ? "current" : ""}
        >
          HubSpot
        </Link>
      </li>
      <li>
        <Link
          href="/admin/customizer"
          className={path.startsWith("/admin/customizer") ? "current" : ""}
        >
          Customizer
        </Link>
      </li>
      <li>
        <Link
          href="/admin/order-approval"
          className={path.startsWith("/admin/order-approval") ? "current" : ""}
        >
          Order Approval
        </Link>
      </li>
    </>
  );
}
