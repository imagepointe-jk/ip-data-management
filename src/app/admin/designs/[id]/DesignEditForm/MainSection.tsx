import styles from "@/styles/designs/DesignPage.module.css";
import { ChangeEvent } from "react";
import { Updater } from "use-immer";
import { DesignDTO } from "@/types/dto/designs";
import { ColorDTO } from "@/types/dto/common";

type Props = {
  design: DesignDTO;
  setDesign: Updater<DesignDTO>;
  colors: ColorDTO[];
};
export function MainSection({ design, setDesign, colors }: Props) {
  function onChangeBackgroundColor(e: ChangeEvent<HTMLSelectElement>) {
    setDesign((draft) => {
      const colorMatch = colors.find((color) => color.id === +e.target.value);
      if (!colorMatch) return;

      draft.defaultBackgroundColorId = colorMatch.id;
      draft.defaultBackgroundColor = colorMatch;
    });
  }

  return (
    <div className={styles["main-section"]}>
      {/* Head section */}

      <h1>
        Design{" "}
        <input
          type="text"
          name="design-number"
          id="design-number"
          value={design.designNumber}
          onChange={(e) =>
            setDesign((draft) => {
              draft.designNumber = e.target.value;
            })
          }
          className={styles["design-number"]}
        />
      </h1>
      <div>Database ID: {design.id}</div>

      {/* Image section */}

      <div>
        <div
          className={styles["main-image-container"]}
          style={{
            backgroundColor: `#${design.defaultBackgroundColor.hexCode}`,
          }}
        >
          <img
            src={design.imageUrl}
            alt="design image"
            style={{
              height: "100%",
            }}
          />
        </div>
        <input
          type="text"
          name="image-url"
          id="image-url"
          value={design.imageUrl}
          placeholder="Image URL"
          size={34}
          onChange={(e) =>
            setDesign((draft) => {
              draft.imageUrl = e.target.value;
            })
          }
        />
      </div>

      {/* Background color section */}

      <div>
        <h4>Default Background Color</h4>
        <select
          name="bg-color"
          id="bg-color"
          value={design.defaultBackgroundColor.id}
          onChange={onChangeBackgroundColor}
        >
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description section */}

      <div>
        <h4>Description</h4>
        <textarea
          name="description"
          id="description"
          value={design.description || ""}
          cols={40}
          rows={10}
          onChange={(e) =>
            setDesign((draft) => {
              draft.description = e.target.value;
            })
          }
        ></textarea>
      </div>
    </div>
  );
}
