"use client";

import { findViewInProductData } from "@/customizer/utils";
import { FullProductSettings } from "@/db/access/customizer";
import { getRenderedSingleView } from "@/fetch/client/customizer";
import { CartState } from "@/types/schema/customizer";
import { useEffect, useState } from "react";

type Props = {
  cart: CartState;
  productSettings: FullProductSettings[];
};
export function DesignView({ cart, productSettings }: Props) {
  const [imgSrc, setImgSrc] = useState(null as string | null);

  async function getImage() {
    try {
      const variation = productSettings
        .flatMap((settings) => settings.variations)
        .find(
          (variation) => variation.id === cart.products[0]?.variations[0]?.id
        );
      const view = variation?.views.find(
        (view) => view.id === cart.products[0]?.variations[0]?.views[0]?.id
      );
      //@ts-ignore
      const imgResponse = await getRenderedSingleView(
        cart.products[0]?.variations[0]?.views[0],
        view?.imageUrl
      );
      if (!imgResponse.ok) {
        throw new Error(`Response status ${imgResponse.status}`);
      }
      const blob = await imgResponse.blob();
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getImage();
  }, []);

  return <>{imgSrc && <img src={imgSrc} />}</>;
}
