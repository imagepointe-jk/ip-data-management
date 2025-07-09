import { LoadingIndicator } from "@/components/LoadingIndicator";
import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { WooCommerceProduct } from "@/types/schema/woocommerce";
import { parseWooCommerceProduct } from "@/types/validations/woo";
import { useEffect, useState } from "react";
import styles from "@/styles/iframe-components/sliders/generalProductSlider.module.css";
import { IframeLink } from "@/components/IframeHelper/IframeLink";

type Props = {
  id?: string;
  finalUrl?: string;
};
export function Card({ id, finalUrl }: Props) {
  const [product, setProduct] = useState<WooCommerceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const image = product?.images ? product.images[0]?.src : undefined;

  async function getProduct() {
    try {
      const response = await fetch(
        `${window.location.origin}/api/woocommerce/products/${id}`
      );
      if (!response.ok)
        throw new Error(
          `Failed to fetch product ${id} with response status ${response.status}`
        );
      const json = await response.json();
      const parsed = parseWooCommerceProduct(json);
      setProduct(parsed);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!finalUrl) getProduct();
  }, []);

  if (finalUrl) {
    return (
      <IframeLink className={styles["product-link"]} href={finalUrl}>
        <div>View More Products</div>
      </IframeLink>
    );
  }

  return (
    <>
      {loading && <LoadingIndicator />}
      {!loading && (
        <>
          {product && (
            <>
              {image && (
                <img src={image} className={styles["featured-image"]} />
              )}
              <div className={styles["overlay-container"]}>
                <div className={styles["product-name"]}>{product.name}</div>
                <IframeLink
                  href={product.permalink}
                  className={styles["product-link"]}
                >
                  View Product
                </IframeLink>
              </div>
            </>
          )}
          {!product && <img src={IMAGE_NOT_FOUND_URL} />}
        </>
      )}
    </>
  );
}
