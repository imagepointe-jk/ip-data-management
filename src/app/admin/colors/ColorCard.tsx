import { Color } from "@prisma/client";
import styles from "@/styles/colorManagement/colors.module.css";

type Props = {
  color: Color;
  onClickDisplayInLibrary: (id: number) => void;
};
export function ColorCard({ color, onClickDisplayInLibrary }: Props) {
  return (
    <div className={styles["card"]}>
      <div className={styles["color-name"]}>
        {color.name}
        <div
          className={styles["color-preview"]}
          style={{ backgroundColor: `#${color.hexCode}` }}
        ></div>
        <div className={styles["color-settings"]}>
          <label>
            <input
              type="checkbox"
              checked={color.displayInDesignLibrary}
              onChange={() => onClickDisplayInLibrary(color.id)}
            />
            Display in Design Library
          </label>
        </div>
      </div>
    </div>
  );
}
