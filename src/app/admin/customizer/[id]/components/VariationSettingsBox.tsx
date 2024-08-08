import { deleteVariation } from "@/actions/customizer/delete";
import { FullProductSettings } from "@/db/access/customizer";
import { Color, CustomProductSettingsVariation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/customizer/CustomProductAdminEditor.module.css";

type VariationSettingsBoxProps = {
  variation: (CustomProductSettingsVariation & { color: Color }) | undefined;
  selectedVariationId: number | undefined;
  settings: FullProductSettings;
  setVariationId: Dispatch<SetStateAction<number | undefined>>;
};
export function VariationSettingsBox({
  variation,
  selectedVariationId,
  settings,
  setVariationId,
}: VariationSettingsBoxProps) {
  const router = useRouter();

  async function onClickDeleteVariation() {
    if (!selectedVariationId) return;

    try {
      await deleteVariation(selectedVariationId);
      const variationBeforeThis = settings.variations.find(
        (variation, i, array) => {
          const next = array[i + 1];
          if (next && next.id === selectedVariationId) return variation;
        }
      );
      setVariationId(variationBeforeThis?.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={styles["variation-settings-container"]}>
      <span
        className={styles["variation-swatch"]}
        style={{
          backgroundColor: `#${variation?.color.hexCode || "ffffff"}`,
        }}
      ></span>{" "}
      Variation Color
      <div>
        <button
          className="button-danger"
          onClick={() => onClickDeleteVariation()}
        >
          Delete Variation
        </button>
      </div>
    </div>
  );
}
