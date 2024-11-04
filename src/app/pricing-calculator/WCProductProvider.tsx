import { validateIframeData } from "@/types/validations/pricing";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type WCProductData = {
  base_price: number;
};
type WCProductContext = {
  productData: WCProductData;
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
  const [productData, setProductData] = useState(null as WCProductData | null);

  function onParentWindowResponse(e: any) {
    if (e.data.type !== "ip-pricing-calculator-response") return;

    try {
      const parsed = validateIframeData(e.data);
      setProductData({ base_price: parsed.net });
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
      type: "ip-pricing-calculator-request",
    });
  }, []);

  if (!productData) return <></>;

  return (
    <WCProductContext.Provider value={{ productData }}>
      {children}
    </WCProductContext.Provider>
  );
}
