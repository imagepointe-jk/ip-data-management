import { CartStateProductView } from "@/types/schema/customizer";
import { CSSProperties } from "react";
import styles from "@/styles/customizer/RenderedProductView.module.css";

//this component is a holdover from when rendering a product view was more complicated.
//could probably be removed.
type Props = {
  view: CartStateProductView;
  bgImgUrl: string;
  renderScale?: number;
  containerStyle?: CSSProperties;
  containerClassName?: string;
};
//used for all non-interactive product view renders.
export function RenderedProductView({
  bgImgUrl,
  view,
  renderScale,
  containerStyle,
  containerClassName,
}: Props) {
  return (
    <div
      className={`${styles["main"]} ${containerClassName || ""}`}
      style={containerStyle}
    >
      <img src={view.currentRenderUrl} />
    </div>
  );
}
