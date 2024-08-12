//Wrap any component in this provider and it will have access to iframe functionality we have commonly needed,
//such as getting the parent window's url data, asking the parent window to navigate to a different page, etc.
//access this functionality using the useIframe hook

"use client";

import {
  ParentWindowData,
  validateResponseData,
} from "@/types/validations/iframeHelper";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

//wherever we've built the window that will contain the iframe,
//these exact strings need to be accounted for there.
const messageTypes = {
  outgoing: {
    urlRequest: "ip-iframe-request-url",
    navigationRequest: "ip-iframe-navigation-request",
    heightChangeRequest: "ip-iframe-height-change-request",
  },
  incoming: {
    urlResponse: "ip-iframe-response-url",
  },
};

type IframeHelperContext = {
  parentWindow: {
    location: ParentWindowData | null;
    requestNavigation: (href: string) => void;
  };
  loading: boolean;
};

const IframeHelperContext = createContext(null as IframeHelperContext | null);

export function useIframe() {
  const context = useContext(IframeHelperContext);
  if (!context) throw new Error("No context");

  return context;
}

type IframeSize = {
  width: number;
  height: number;
};
type Props = {
  children: ReactNode;
  iframeSizes?: IframeSize[];
};
export function IframeHelperProvider({ children, iframeSizes }: Props) {
  const [parentWindowData, setParentWindowData] = useState(
    null as ParentWindowData | null
  );
  const [loading, setLoading] = useState(true);

  function onParentWindowResponse(e: any) {
    try {
      const parsed = validateResponseData(e.data);
      setParentWindowData(parsed);
    } catch (error) {
      console.error("Invalid parent window response");
    }
    setLoading(false);
  }

  function updateIframeHeight(width: number) {
    if (!iframeSizes) return;

    //in the provided iframeSizes, find the one with the lowest width that is greater than the given width.
    //if none are greater, choose the size with the greatest width.
    const sizesSorted = iframeSizes.sort((a, b) => b.width - a.width);
    let size = sizesSorted[0];
    for (const thisSize of iframeSizes) {
      if (thisSize.width > width) size = thisSize;
      else break;
    }
    if (!size) return;

    postMessage({
      type: messageTypes.outgoing.heightChangeRequest,
      height: `${size.height}px`,
    });
  }

  function onIframeResize(e: any) {
    updateIframeHeight(e.target.innerWidth);
  }

  function requestNavigation(href: string) {
    postMessage({ type: messageTypes.outgoing.navigationRequest, href });
  }

  function postMessage(data: any) {
    window.parent.postMessage(data, "*");
  }

  useEffect(() => {
    updateIframeHeight(window.innerWidth);

    window.addEventListener("message", onParentWindowResponse);
    window.addEventListener("resize", onIframeResize);

    postMessage({ type: messageTypes.outgoing.urlRequest });

    return () => {
      window.removeEventListener("message", onParentWindowResponse);
      window.removeEventListener("resize", onIframeResize);
    };
  }, []);

  return (
    <IframeHelperContext.Provider
      value={{
        parentWindow: {
          location: parentWindowData,
          requestNavigation,
        },
        loading,
      }}
    >
      {children}
    </IframeHelperContext.Provider>
  );
}