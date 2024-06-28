import { DesignVariationWithIncludes } from "@/types/types";
import { DesignDataFormProps } from "./DesignDataForm";
import styles from "@/styles/designs/DesignPage.module.css";

export function DesignVariations({ existingDesign }: DesignDataFormProps) {
  return (
    <div>
      <h4>Variations</h4>
      <div className={styles["variations-container"]}>
        {(!existingDesign || existingDesign.variations.length === 0) &&
          "No varaitions"}
        {existingDesign &&
          existingDesign.variations.map((variation) => (
            //   <div key={variation.id}>{variation.color.name} variation</div>
            <VariationCard key={variation.id} variation={variation} />
          ))}
      </div>
    </div>
  );
}

type VariationCardProps = {
  variation: DesignVariationWithIncludes;
};
function VariationCard({ variation }: VariationCardProps) {
  return (
    <div className={styles["variation-card"]}>
      <img
        src={variation.imageUrl}
        style={{ backgroundColor: `#${variation.color.hexCode}` }}
      />
      Color: {variation.color.name}
    </div>
  );
}
