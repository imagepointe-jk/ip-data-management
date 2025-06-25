"use client";
import { IframeHelperProvider } from "@/components/IframeHelper/IframeHelperProvider";
import { IframeResponsiveContainer } from "@/components/IframeHelper/IframeResponsiveContainer";
import styles from "@/styles/iframe-components/sections/homePageServices.module.css";
import { Card } from "./Card";
import { CardSliderSimple } from "@/components/CardSliderSimple/CardSliderSimple";
import { useState } from "react";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { wrapArray } from "@/utility/misc";

export type CardData = {
  id: string;
  heading: string;
  headingOverride?: string;
  body: string;
  backgroundImageUrl: string;
};
const data: CardData[] = [
  {
    id: "1",
    heading: "Screen Print",
    body: "Backed by decades of experience, our skilled union screen printers take pride in producing quality prints that last and your members are proud to wear.",
    backgroundImageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/06/Services_ScreenPrint.jpg",
  },
  {
    id: "2",
    heading: "Direct-To-Film",
    headingOverride: "Direct To Film",
    body: "Direct-To-Film is our newest, custom decoration option that will showcase your design with incredible detail, brilliant colors and bright whites.",
    backgroundImageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/06/Services_DirectToFilm.jpg",
  },
  {
    id: "3",
    heading: "Webstore/ Fulfillment",
    body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus ipsam, quidem eveniet eligendi deserunt ducimus ipsum, pariatur natus consectetur iusto.",
    backgroundImageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/06/Services_WebstoresFullfilment.jpg",
  },
  {
    id: "4",
    heading: "Embroidery",
    body: "With 88 embroidery heads and expert union operators, we create high-quality designs on hats, polos, and more, plus options like laser-cut details and custom patches.",
    backgroundImageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/06/Services_Embroidery.jpg",
  },
  {
    id: "5",
    heading: "Art",
    body: "Our in-house Art Department is powered by six full-time union artists with over 50 years of experience, creating bold, custom designs that showcase your union's strength and pride.",
    backgroundImageUrl:
      "https://www.imagepointe.com/wp-content/uploads/2025/06/Services_Art.jpg",
  },
];

export default function Page() {
  const [index, setIndex] = useState(0);
  const sliderData = wrapArray([...data].reverse(), 1);
  const currentCard = sliderData[index];
  const imageUrl = currentCard?.backgroundImageUrl || IMAGE_NOT_FOUND_URL;
  const inactiveCards = wrapArray(data, index).slice(1);

  return (
    <IframeHelperProvider iframeId="home-page-services">
      <IframeResponsiveContainer className={styles["main"]}>
        <div
          className={styles["container"]}
          style={{ backgroundImage: `url("${imageUrl}")` }}
        >
          <div className={styles["container-overlay"]}></div>
          <CardSliderSimple
            dataset={sliderData}
            className={styles["slider"]}
            cardContainerClassName={styles["card-container"]}
            cardClassName={styles["card"]}
            createCard={(data) => <Card data={data} />}
            dotClassNameInactive={styles["dot-inactive"]}
            dotClassNameActive={styles["dot-active"]}
            buttonClassName={styles["arrow-button"]}
            endBehavior="rewind"
            indexOverride={index}
            onChangeIndex={(index) => setIndex(index)}
          />
        </div>
        <div className={styles["inactive-cards-container"]}>
          {inactiveCards.map((card) => (
            <div
              key={card.id}
              className={styles["inactive-card"]}
              style={{ backgroundImage: `url("${card.backgroundImageUrl}")` }}
            >
              <div className={styles["inactive-card-overlay"]}></div>
              <div className={styles["inactive-card-heading"]}>
                {card.headingOverride || card.heading}
              </div>
            </div>
          ))}
        </div>
      </IframeResponsiveContainer>
    </IframeHelperProvider>
  );
}
