import Link from "next/link";
import AuthButton from "./AuthButton.server";
import { usePathname } from "next/navigation";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  return (
    <nav>
      <ul className="links-row">
        <li>
          <img src="/ip-logo.png" className="ip-logo" />
        </li>
        <NavbarLinks />
      </ul>
      <AuthButton />
    </nav>
  );
}
