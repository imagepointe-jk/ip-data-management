import Link from "next/link";
import AuthButton from "./AuthButton.server";

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/users">Users</Link>
        </li>
        <li>
          <Link href="/designs">Designs</Link>
        </li>
        <li>
          <Link href="/hubspot">HubSpot</Link>
        </li>
      </ul>
      <AuthButton />
    </nav>
  );
}
