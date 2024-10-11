import { getRenderedSingleView } from "@/fetch/client/customizer";
import { CartStateProductView } from "@/types/schema/customizer";
import { useEffect, useState } from "react";
import styles from "@/styles/customizer/LeadSingleView.module.css";
import { LoadingIndicator } from "@/components/LoadingIndicator";

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
  const [imgSrc, setImgSrc] = useState(null as string | null);
  const [loading, setLoading] = useState(true);

  async function getImage() {
    try {
      const imgResponse = await getRenderedSingleView(view, bgImgUrl);
      if (!imgResponse.ok) {
        throw new Error(`Response status ${imgResponse.status}`);
      }
      const blob = await imgResponse.blob();
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    getImage();
  }, []);

  return (
    <div className={styles["variation-view-main"]}>
      <div
        className={`${styles["variation-view-img-container"]} ${
          expanded ? styles["expanded"] : ""
        }`}
      >
        {loading && <LoadingIndicator className={styles["img-loading"]} />}
        {imgSrc && <img src={imgSrc} />}
      </div>
      <div>({viewName})</div>
    </div>
  );
}
