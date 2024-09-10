import { IMAGE_NOT_FOUND_URL } from "@/constants";
import styles from "@/styles/customizer/CustomProductDesigner.module.css";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  imageSrc: string | undefined;
  text: string | undefined;
};
export function Card({ isSelected, imageSrc, text, onClick }: Props) {
  return (
    <div
      className={`${styles["starter-step-card"]} ${
        isSelected ? styles["starter-step-card-clicked"] : ""
      }`}
      onClick={() => onClick()}
    >
      <div className={styles["starter-step-card-img-container"]}>
        <img
          className={styles["starter-step-card-img"]}
          src={imageSrc || IMAGE_NOT_FOUND_URL}
        />
      </div>
      <div className={styles["starter-step-card-text"]}>
        {text || "Name Not Found"}
      </div>
    </div>
  );
}
