"use client";

import styles from "@/styles/customizer/LeadSingleView.module.css";
import { CartState, PopulatedProductSettings } from "@/types/schema/customizer";
import { useState } from "react";
import { CustomProductView } from "./CustomProductView";

//display all views of all products in the quote request
type Props = {
  cart: CartState;
  productSettings: PopulatedProductSettings[];
};
export function CustomProductsDisplay({ cart, productSettings }: Props) {
  const [expandedImages, setExpandedImages] = useState(false);

  return (
    <div className="vert-flex-group">
      <div>
        <button onClick={() => setExpandedImages(!expandedImages)}>
          {expandedImages ? "- Shrink Images" : "+ Expand Images"}
        </button>
      </div>
      {/* Show each product in the quote request */}

      {cart.products.map((product) => {
        const productFromDb = productSettings.find(
          (dbProduct) => product.id === dbProduct.id
        );

        return (
          <div key={product.id} className="content-frame vert-flex-group">
            <div>{productFromDb?.product?.name || "UNKNOWN PRODUCT"}</div>

            {/* Within each product, show all the variations of the product */}

            {product.variations.map((variation) => {
              const variationFromDb = productFromDb?.variations.find(
                (dbVariation) => dbVariation.id === variation.id
              );

              return (
                <div key={variation.id} className="content-frame-minor">
                  <div>{variationFromDb?.color.name || "UNKNOWN COLOR"}</div>

                  {/* Within each variation, show all the views of the product, and render the views based on the cart data */}

                  <div className={styles["variation-views-container"]}>
                    {variation.views.map((view) => {
                      const viewFromDb = variationFromDb?.views.find(
                        (dbView) => dbView.id === view.id
                      );
                      console.log(
                        `For ${variationFromDb?.color.name}, found ${viewFromDb?.id} by looking for ${view.id}`
                      );
                      return (
                        <CustomProductView
                          key={view.id}
                          view={view}
                          viewName={viewFromDb?.name || "UNKNOWN VIEW"}
                          bgImgUrl={`${viewFromDb?.imageUrl}`}
                          expanded={expandedImages}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
