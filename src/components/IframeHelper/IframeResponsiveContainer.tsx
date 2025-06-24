"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useIframe } from "./IframeHelperProvider";

//this wrapper uses a ResizeObserver to detect when the container changes size.
//whenever it does, it asks the iframe's parent window to resize the iframe based on the container's new scrollHeight.
//this helps prevent scrollbars when content in an iframe changes its vertical size in response to narrower displays.
type Props = {
  children: ReactNode;
};
export function IframeResponsiveContainer({ children }: Props) {
  const { parentWindow } = useIframe();
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = mainRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      parentWindow.requestHeightChange(element.scrollHeight);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [parentWindow]);

  return <div ref={mainRef}>{children}</div>;
}
