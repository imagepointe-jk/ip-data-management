import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav style={{ background: "none", zIndex: "initial" }}>
        <ul className="links-row">
          <li>
            <Link href="/admin/designs" className="normal-link">
              Designs
            </Link>
          </li>
          <li>
            <Link href="/admin/designs/tools" className="normal-link">
              Tools
            </Link>
          </li>
          <li>
            <Link href="/admin/designs/tags" className="normal-link">
              Tags
            </Link>
          </li>
          <li>
            <Link href="/admin/designs/categories" className="normal-link">
              Categories
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
