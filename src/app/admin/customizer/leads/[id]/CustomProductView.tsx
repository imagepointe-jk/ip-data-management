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
      {view.artworks.length > 0 && (
        <>
          <div>Artworks</div>
          <ul>
            {view.artworks.map((art) => (
              <li key={art.objectData.editorGuid}>
                <span>
                  {art.identifiers.designIdentifiers?.designId
                    ? `Design ID ${art.identifiers.designIdentifiers.designId}`
                    : `Custom Artwork`}
                </span>
                <a href={art.imageUrl}>(View Image)</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
