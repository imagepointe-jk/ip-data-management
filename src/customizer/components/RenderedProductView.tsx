import { getRenderedSingleView } from "@/fetch/client/customizer";
import { CartStateProductView } from "@/types/schema/customizer";
import { CSSProperties, useEffect, useState } from "react";
import styles from "@/styles/customizer/RenderedProductView.module.css";
import { LoadingIndicator } from "@/components/LoadingIndicator";

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
  const [imgSrc, setImgSrc] = useState(null as string | null);
  const [loading, setLoading] = useState(true);

  async function getImage() {
    try {
      const imgResponse = await getRenderedSingleView(
        view,
        bgImgUrl,
        renderScale
      );
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
    <div
      className={`${styles["main"]} ${containerClassName || ""}`}
      style={containerStyle}
    >
      {loading && <LoadingIndicator className={styles["img-loading"]} />}
      {imgSrc && <img src={imgSrc} />}
    </div>
  );
}
