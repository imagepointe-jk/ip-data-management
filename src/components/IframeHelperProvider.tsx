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
    consoleLog: "ip-iframe-console-log",
    consoleError: "ip-iframe-console-error",
  },
  incoming: {
    urlResponse: "ip-iframe-response-url",
  },
};

type IframeHelperContext = {
  parentWindow: {
    location: ParentWindowData | null;
    console: {
      log: (message?: any, ...optionalParams: any[]) => void;
      error: (...data: any[]) => void;
    };
  };
  loading: boolean;
};

const IframeHelperContext = createContext(null as IframeHelperContext | null);

export function useIframe() {
  const context = useContext(IframeHelperContext);
  if (!context) throw new Error("No context");

  return context;
}

export function IframeHelperProvider({ children }: { children: ReactNode }) {
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

  function parentConsoleLog(message: any, ...optionalParams: any[]) {
    window.parent.postMessage({
      type: messageTypes.outgoing.consoleLog,
      log: `${message} ${optionalParams.join(" ")}`,
    });
  }

  function parentConsoleError(...data: any[]) {
    window.parent.postMessage({
      type: messageTypes.outgoing.consoleError,
      log: data.join(" "),
    });
  }

  useEffect(() => {
    window.addEventListener("message", onParentWindowResponse);
    window.parent.postMessage({ type: messageTypes.outgoing.urlRequest }, "*");

    return () => {
      window.removeEventListener("message", onParentWindowResponse);
    };
  }, []);

  return (
    <IframeHelperContext.Provider
      value={{
        parentWindow: {
          location: parentWindowData,
          console: {
            log: parentConsoleLog,
            error: parentConsoleError,
          },
        },
        loading,
      }}
    >
      {children}
    </IframeHelperContext.Provider>
  );
}
