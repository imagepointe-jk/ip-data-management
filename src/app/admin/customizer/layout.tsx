import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav style={{ background: "none" }}>
        <ul className="links-row">
          <li>
            <Link href="/admin/customizer" className="normal-link">
              Products
            </Link>
          </li>
          <li>
            <Link href="/admin/customizer/leads" className="normal-link">
              Leads
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
