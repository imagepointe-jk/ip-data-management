"use client";

import { CardSlider } from "@/components/CardSlider/CardSlider";
import { Card } from "./Card";
import styles from "@/styles/iframe-components/sliders/generalProductSlider.module.css";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sortByIdOrder } from "@/utility/misc";

function Page() {
  const search = useSearchParams();
  const ids = `${search.get("ids")}`.split(",");
  const dataset = ids.map((id) => ({ id }));
  const sorted = sortByIdOrder(dataset, ids, (item) => item.id);

  return (
    <IframeHelperProvider>
      <CardSlider
        dataset={sorted}
        createCard={(data) => <Card id={data.id} />}
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
