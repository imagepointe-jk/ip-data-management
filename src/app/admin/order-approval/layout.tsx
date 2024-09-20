import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav style={{ background: "none" }}>
        <ul className="links-row">
          <li>
            <Link href="/admin/order-approval" className="normal-link">
              Workflows
            </Link>
          </li>
          <li>
            <Link
              href="/admin/order-approval/webstores"
              className="normal-link"
            >
              Webstores
            </Link>
          </li>
          <li>
            <Link href="/admin/order-approval/tools" className="normal-link">
              Tools
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
