import { IMAGE_NOT_FOUND_URL } from "@/constants";
import styles from "@/styles/customizer/CustomProductDesigner/starterStep.module.css";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  imageSrc: string | undefined;
  text: string | undefined;
  id?: string;
};
export function Card({ id, isSelected, imageSrc, text, onClick }: Props) {
  return (
    <div
      id={id}
      className={`${styles["card"]} ${
        isSelected ? styles["card-clicked"] : ""
      }`}
      onClick={() => onClick()}
    >
      <div className={styles["card-img-container"]}>
        <img
          className={styles["card-img"]}
          src={imageSrc || IMAGE_NOT_FOUND_URL}
        />
      </div>
      <div className={styles["card-text"]}>{text || "Name Not Found"}</div>
    </div>
  );
}
