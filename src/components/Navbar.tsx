import Link from "next/link";
import AuthButton from "./AuthButton.server";

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Link 1</Link>
        </li>
        <li>
          <Link href="/">Link 2</Link>
        </li>
        <li>
          <Link href="/">Link 3</Link>
        </li>
      </ul>
      <AuthButton />
    </nav>
  );
}
