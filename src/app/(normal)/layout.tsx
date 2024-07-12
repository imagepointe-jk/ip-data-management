import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Custom Union and USA Made Products | Image Pointe",
  description: "Custom Union and USA Made Products",
};

export default function NormalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
