"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/AdminNavbar.module.css";
import { useState } from "react";

export default function NavbarLinks() {
  const path = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      <li>
        <Link
          href="/admin/tracking"
          className={path.startsWith("/admin/tracking") ? "current" : ""}
        >
          Tracking
        </Link>
      </li>
      <li>
        <Link
          href="/admin/dignity-apparel"
          className={path.startsWith("/admin/dignity-apparel") ? "current" : ""}
        >
          Dignity Apparel
        </Link>
      </li>
      <li>
        <Link
          href="/admin/products/asi"
          className={path.startsWith("/admin/products/asi") ? "current" : ""}
        >
          Products
        </Link>
      </li>
      <li className={styles["dropdown-parent"]}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}>More...</button>
        {dropdownOpen && (
          <ul className={styles["dropdown"]}>
            <li>
              <Link href="/admin/colors">Colors</Link>
            </li>
            <li>
              <Link href="/admin/tax">Taxes</Link>
            </li>
          </ul>
        )}
      </li>
    </>
  );
}
