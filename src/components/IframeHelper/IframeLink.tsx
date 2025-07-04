//emulates the navigation behavior of an <a> tag, but within an iframe.
//Sends a request to the parent window to navigate to the given url.
//only for use in the IframeHelper context.

"use client";

import { CSSProperties, MouseEvent, ReactNode } from "react";
import { useIframe } from "./IframeHelperProvider";

type Props = {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};
export function IframeLink({ children, className, style, href }: Props) {
  const {
    parentWindow: { requestNavigation },
  } = useIframe();

  function onClick(e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) {
    e.preventDefault();

    const a = e.target as HTMLAnchorElement;
    requestNavigation(a.href);
  }

  return (
    <a href={href} className={className} style={style} onClick={onClick}>
      {children}
    </a>
  );
}
