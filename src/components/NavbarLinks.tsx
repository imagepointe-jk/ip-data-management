"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks() {
  const path = usePathname();

  return (
    <>
      <li>
        <Link href="/" className={path === "/" ? "current" : ""}>
          Home
        </Link>
      </li>
      <li>
        <Link href="/users" className={path === "/users" ? "current" : ""}>
          Users
        </Link>
      </li>
      <li>
        <Link href="/designs" className={path === "/designs" ? "current" : ""}>
          Designs
        </Link>
      </li>
      <li>
        <Link href="/hubspot" className={path === "/hubspot" ? "current" : ""}>
          HubSpot
        </Link>
      </li>
      <li>
        <Link
          href="/customizer"
          className={path === "/customizer" ? "current" : ""}
        >
          Customizer
        </Link>
      </li>
    </>
  );
}
