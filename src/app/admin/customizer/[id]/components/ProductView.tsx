import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import { CustomProductView } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { createLocationFrameInlineStyles } from "@/customizer/editor";
import { IMAGE_NOT_FOUND_URL } from "@/constants";

type ProductViewProps = {
  view:
    | (CustomProductView & {
        locations: CustomProductDecorationLocationNumeric[];
      })
    | undefined;
  setLocationId: Dispatch<SetStateAction<number | undefined>>;
};
export function ProductView({ view, setLocationId }: ProductViewProps) {
  return (
    <div className={styles["product-view-frame"]}>
      <img
        src={view?.imageUrl || IMAGE_NOT_FOUND_URL}
        className={styles["product-view-img"]}
      />
      {view &&
        view.locations.map((location) => (
          <div
            key={location.id}
            className={styles["location-frame"]}
            style={createLocationFrameInlineStyles({
              width: `${location.width}`,
              height: `${location.height}`,
              positionX: `${location.positionX}`,
              positionY: `${location.positionY}`,
            })}
            onClick={() => setLocationId(location.id)}
          >
            <div className={styles["location-name"]}>{location.name}</div>
          </div>
        ))}
    </div>
  );
}
