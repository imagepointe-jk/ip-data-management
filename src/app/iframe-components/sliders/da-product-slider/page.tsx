"use client";

import { CardSlider } from "@/components/CardSlider/CardSlider";
import { Card } from "./Card";
import styles from "@/styles/iframe-components/sliders/daProductSlider.module.css";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sortByIdOrder } from "@/utility/misc";

const BLACK = "#000000";
const PURPLE = "#483370";
const NAVY = "#262d38";
const ROYAL = "#005eab";
const STORM_GREY_HEATHER = "#737373";
const HEATHER_MILITARY_GREEN = "#818f6c";
const CHARCOAL = "#5c5c5c";
const RED = "#cd2527";
const WHITE = "#f3f5f7";
const HEATHER_CHARCOAL = "#a7a7a7";
const SAFETY_ORANGE = "#f36523";
const SAFETY_YELLOW = "#cddd2a";
const STORM = "#6265aa";
const CARBON = "#a7a7a7";
const ONYX = "#000000";

type Product = {
  id: string;
  name: string;
  imageUrl: string;
  productUrl: string;
  subtext: string;
  colors: string[];
};
const products: Product[] = [
  {
    id: "DASSTRI003",
    name: "Dignity Comfort Tee",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/03/MG_0541_DASSTRI003_Royal_Ryan_Web1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/dignity-comfort-tee/",
    subtext: "4.5 oz, poly/cotton/modal blend",
    colors: [
      BLACK,
      PURPLE,
      NAVY,
      ROYAL,
      STORM_GREY_HEATHER,
      HEATHER_MILITARY_GREEN,
    ],
  },
  {
    id: "DASST001",
    name: "Dignity Everyday Tee",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/05/DASST001-Red-1850.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/apparel/t-shirts/dignity-everyday-tee/",
    subtext: "5.5 oz, 100% cotton",
    colors: [BLACK, CHARCOAL, PURPLE, RED, NAVY, WHITE],
  },
  {
    id: "DASST002",
    name: "Dignity Premium Tee",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/04/IMG_0345_DASST002_Navy_Jess_Web1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/dignity-premium-tee/",
    subtext: "6 oz, 100% ringspun cotton",
    colors: [BLACK, HEATHER_CHARCOAL, PURPLE, NAVY],
  },
  {
    id: "DASST004",
    name: "Dignity Safety Tee",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/05/DASST004-SafetyYellow-Tyrone-UWUA-1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/dignity-safety-tee/",
    subtext: "5.8 oz, cotton/poly blend",
    colors: [SAFETY_ORANGE, SAFETY_YELLOW],
  },
  {
    id: "DAP002",
    name: "Men's Sullivan Polo",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/GL6A5805-DAP002Royal-Larry-1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/union-made-mens-sullivan-polo/",
    subtext: "4.5 oz, 100% moisture-wicking polyester",
    colors: [BLACK, HEATHER_CHARCOAL, ROYAL, RED],
  },
  {
    id: "DAWP002",
    name: "Ladies' Sullivan Polo",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/DSC04311-DAWP002Cardinal-Margaret-1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/union-made-ladies-sullivan-polo/",
    subtext: "4.5 oz, 100% moisture-wicking polyester",
    colors: [BLACK, HEATHER_CHARCOAL, ROYAL, RED],
  },
  {
    id: "DAP003",
    name: "Men's Performance Polo",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/DSC04447-DAP001Carbon-Tyrone-1200px-1.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/union-made-mens-polo/",
    subtext: "5.4 oz, 100% moisture-wicking polyester",
    colors: [ONYX, CARBON, NAVY, RED, STORM],
  },
  {
    id: "DAWP003",
    name: "Ladies' Performance Polo",
    imageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2024/02/DSC04554-DAP001-Dani2-1200px.jpg",
    productUrl:
      "https://www.imagepointe.com/shop/dignity-apparel-products/union-made-ladies-performance-polo/",
    subtext: "5.4 oz, 100% moisture-wicking polyester",
    colors: [ONYX, CARBON, NAVY, RED, STORM],
  },
];

function Page() {
  const search = useSearchParams();
  //"id" in the product array above is actually SKUs, but adapted for CardSlider so conform to the type HasID
  const skus = search.get("skus")
    ? `${search.get("skus")}`.split(",")
    : products.map((product) => product.id); //get all skus given by search params; include all if param not present
  const filteredProducts = products.filter((product) =>
    skus.find(
      (sku) => sku.toLocaleLowerCase() === product.id.toLocaleLowerCase()
    )
  );
  const sortedProducts = sortByIdOrder(
    filteredProducts,
    skus,
    (product) => product.id
  );

  return (
    <IframeHelperProvider>
      <CardSlider
        dataset={sortedProducts}
        createCard={(data) => <Card card={data} />}
        cardClassName={styles["card"]}
        cardContainerClassName={styles["card-container"]}
        slidingParentClassName={styles["sliding-parent"]}
      />
    </IframeHelperProvider>
  );
}

export default function PageWrapped() {
  return (
    <Suspense>
      <Page />
    </Suspense>
  );
}
