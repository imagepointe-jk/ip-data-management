import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import { CustomProductView } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";
import { createLocationFrameInlineStyles } from "@/customizer/editor";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { createView } from "@/actions/customizer/create";
import { ButtonWithLoading } from "@/components/ButtonWithLoading";
import { deleteView } from "@/actions/customizer/delete";
import { wrap } from "@/utility/misc";

type ProductViewProps = {
  selectedVariationId: number | undefined;
  views: (CustomProductView & {
    locations: CustomProductDecorationLocationNumeric[];
  })[];
  selectedView:
    | (CustomProductView & {
        locations: CustomProductDecorationLocationNumeric[];
      })
    | undefined;
  setViewId: Dispatch<SetStateAction<number | undefined>>;
  setLocationId: Dispatch<SetStateAction<number | undefined>>;
};
export function ProductView({
  selectedView,
  setViewId,
  views,
  setLocationId,
  selectedVariationId,
}: ProductViewProps) {
  const [isAddingView, setIsAddingView] = useState(false);
  const [isDeletingView, setIsDeletingView] = useState(false);
  const router = useRouter();
  const deleteAllowed = views.length > 1;

  async function onClickAddView() {
    if (selectedVariationId === undefined) return;
    setIsAddingView(true);

    try {
      const created = await createView(selectedVariationId);
      router.refresh();
      setViewId(created.id);
    } catch (error) {
      console.error(error);
    }

    setIsAddingView(false);
  }

  async function onClickDeleteView() {
    if (!selectedView || !deleteAllowed) return;
    setIsDeletingView(true);

    try {
      await deleteView(selectedView.id);
      const curViewIndex = views.findIndex(
        (view) => view.id === selectedView.id
      );
      const prevViewIndex = wrap(curViewIndex - 1, 0, views.length - 1);
      const prevViewId = views[prevViewIndex]?.id;
      router.refresh();
      setViewId(prevViewId);
    } catch (error) {
      console.error(error);
    }

    setIsDeletingView(false);
  }

  return (
    <div className={styles["product-view-frame"]}>
      <img
        src={selectedView?.imageUrl || IMAGE_NOT_FOUND_URL}
        className={styles["product-view-img"]}
      />
      {selectedView &&
        selectedView.locations.map((location) => (
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
      <div className={styles["view-controls-container"]}>
        <div>
          <ButtonWithLoading
            loading={isAddingView}
            normalText="+ Add View"
            onClick={() => onClickAddView()}
          />
        </div>
        {deleteAllowed && (
          <div>
            <ButtonWithLoading
              loading={isDeletingView}
              normalText="- Delete View"
              onClick={() => onClickDeleteView()}
              className="button-danger"
            />
          </div>
        )}
      </div>
    </div>
  );
}
