import { RenderedProductView } from "@/customizer/components/RenderedProductView";
import styles from "@/styles/customizer/LeadSingleView.module.css";
import { CartStateProductView } from "@/types/schema/customizer";

type Props = {
  view: CartStateProductView;
  viewName: string;
  bgImgUrl: string;
  expanded: boolean;
};
export function CustomProductView({
  bgImgUrl,
  view,
  viewName,
  expanded,
}: Props) {
  return (
    <div className={styles["variation-view-main"]}>
      <RenderedProductView
        bgImgUrl={bgImgUrl}
        view={view}
        containerStyle={
          expanded ? { width: "600px", height: "600px" } : undefined
        }
        renderScale={2}
      />
      <div>({viewName})</div>
    </div>
  );
}
