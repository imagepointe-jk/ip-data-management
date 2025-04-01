import { createDesignVariation } from "@/actions/designs/create";
import { deleteDesignVariation } from "@/actions/designs/delete";
import { useToast } from "@/components/ToastProvider";
import styles from "@/styles/designs/DesignPage.module.css";
import {
  DesignCategoryWithIncludes,
  DesignWithIncludes,
} from "@/types/schema/designs";
import { clamp } from "@/utility/misc";
import { Color, DesignTag } from "@prisma/client";
import { useState } from "react";
import { Updater } from "use-immer";
import {
  DesignVariationCard,
  VARIATION_CARD_WIDTH,
} from "./DesignVariationCard";

type Props = {
  design: DesignWithIncludes;
  setDesign: Updater<DesignWithIncludes>;
  tags: DesignTag[];
  categories: DesignCategoryWithIncludes[];
  colors: Color[];
};
export function DesignVariations({
  design,
  setDesign,
  categories,
  tags,
  colors,
}: Props) {
  const [viewedVariation, setViewedVariation] = useState(0);
  const sorted = [...design.variations];
  const toast = useToast();
  //ensures that the variations always appear in a stable order (the specific order doesn't matter)
  sorted.sort((a, b) => a.id - b.id);

  async function onClickAddVariation() {
    const created = await createDesignVariation(design.id);
    setDesign((draft) => {
      draft.variations.push(created);
    });

    toast.toast("Variation created.", "success");
  }

  async function onClickDeleteVariation(id: number) {
    await deleteDesignVariation(id);
    setDesign((draft) => {
      draft.variations = draft.variations.filter(
        (variation) => variation.id !== id
      );
    });

    setViewedVariation(clamp(viewedVariation - 1, 0, 9999));
    toast.toast("Variation deleted.", "success");
  }

  function onClickScroll(direction: "left" | "right") {
    if (direction === "left" && viewedVariation > 0)
      setViewedVariation(viewedVariation - 1);
    if (direction === "right" && viewedVariation < sorted.length - 1)
      setViewedVariation(viewedVariation + 1);
  }

  return (
    <>
      <div className={styles["variations-heading-container"]}>
        <h4>
          Variations{" "}
          {sorted.length > 0
            ? `(viewing ${viewedVariation + 1} of ${sorted.length})`
            : "(none yet)"}
        </h4>
        <button
          type="button"
          className={styles["variations-scroll-button"]}
          onClick={() => onClickScroll("left")}
          disabled={viewedVariation < 1}
        >
          &lt;
        </button>
        <button
          type="button"
          className={styles["variations-scroll-button"]}
          onClick={() => onClickScroll("right")}
          disabled={viewedVariation > sorted.length - 2}
        >
          &gt;
        </button>
        <button
          type="button"
          className={styles["variations-add"]}
          onClick={onClickAddVariation}
        >
          + Add New
        </button>
      </div>
      <div className={styles["variations-container"]}>
        <div
          className={styles["variations-strip"]}
          style={{
            left: `${-1 * VARIATION_CARD_WIDTH * viewedVariation}px`,
          }}
        >
          {sorted.map((variation, i) => (
            <DesignVariationCard
              key={variation.id}
              designTypeId={design.designTypeId}
              variation={variation}
              setDesign={setDesign}
              colors={colors}
              categories={categories}
              tags={tags}
              onClickDelete={onClickDeleteVariation}
            />
          ))}
        </div>
      </div>
    </>
  );
}
