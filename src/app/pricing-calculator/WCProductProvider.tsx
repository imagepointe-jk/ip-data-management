import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type WCProductContext = {
  base_price: number;
};

const WCProductContext = createContext(null as WCProductContext | null);

export function useProduct() {
  const context = useContext(WCProductContext);
  if (context === null) throw new Error("No context");

  return context;
}

type Props = {
  children: ReactNode;
};
export function WCProductProvider({ children }: Props) {
  const [testVal, setTestVal] = useState(42);

  function onParentWindowResponse(e: any) {
    if (
      ["react-devtools-content-script", "react-devtools-bridge"].includes(
        e.data.source
      )
    )
      return; //ignore messages from devtools
    try {
      console.log(e.data);
    } catch (error) {
      console.error("Invalid parent window response");
    }
  }

  function postMessage(data: any) {
    window.parent.postMessage(data, "*");
  }

  useEffect(() => {
    window.addEventListener("message", onParentWindowResponse);

    postMessage({
      type: "ip-pricing-calculator-test",
    });
  }, []);

  return (
    <WCProductContext.Provider value={{ base_price: testVal }}>
      {children}
    </WCProductContext.Provider>
  );
}
