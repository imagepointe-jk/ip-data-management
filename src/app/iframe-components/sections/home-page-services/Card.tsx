import styles from "@/styles/iframe-components/sections/homePageServices.module.css";
import { CardData } from "./page";

type Props = {
  data: CardData;
};
export function Card({ data }: Props) {
  return (
    <>
      <h3 className={styles["heading"]}>{data.heading}</h3>
      <div className={styles["body"]}>{data.body}</div>
    </>
  );
}
