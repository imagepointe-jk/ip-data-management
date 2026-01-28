import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav style={{ background: "none", zIndex: "initial" }}>
        <ul className="links-row">
          <li>
            <Link href="/admin/products/general" className="normal-link">
              General
            </Link>
          </li>
          <li>
            <Link href="/admin/products/asi" className="normal-link">
              ASI
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
