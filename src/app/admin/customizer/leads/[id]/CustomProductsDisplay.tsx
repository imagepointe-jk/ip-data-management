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
            <div>{productFromDb?.product?.sku || "UNKNOWN SKU"}</div>

            {/* Within each product, show all the variations of the product */}

            {product.variations.map((variation) => {
              const variationFromDb = productFromDb?.variations.find(
                (dbVariation) => dbVariation.id === variation.id
              );
              const { quantities } = variation;
              const quantityTotal =
                quantities.s +
                quantities.m +
                quantities.l +
                quantities.xl +
                quantities["2xl"] +
                quantities["3xl"] +
                quantities["4xl"] +
                quantities["5xl"] +
                quantities["6xl"];

              return (
                <div
                  key={variation.id}
                  className="content-frame-minor horz-flex-group"
                >
                  <div className="vert-flex-group">
                    <div>
                      <div className="data-label">Color</div>
                      <div>
                        {variationFromDb?.color.name || "UNKNOWN COLOR"}
                      </div>
                    </div>
                    <div>
                      <div className="data-label">Sizes/Quantities</div>
                      <table>
                        <thead>
                          <tr>
                            <th>Size</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Small</td>
                            <td>{quantities.s}</td>
                          </tr>
                          <tr>
                            <td>Medium</td>
                            <td>{quantities.m}</td>
                          </tr>
                          <tr>
                            <td>Large</td>
                            <td>{quantities.l}</td>
                          </tr>
                          <tr>
                            <td>XL</td>
                            <td>{quantities.xl}</td>
                          </tr>
                          <tr>
                            <td>2XL</td>
                            <td>{quantities["2xl"]}</td>
                          </tr>
                          <tr>
                            <td>3XL</td>
                            <td>{quantities["3xl"]}</td>
                          </tr>
                          <tr>
                            <td>4XL</td>
                            <td>{quantities["4xl"]}</td>
                          </tr>
                          <tr>
                            <td>5XL</td>
                            <td>{quantities["5xl"]}</td>
                          </tr>
                          <tr>
                            <td>6XL</td>
                            <td>{quantities["6xl"]}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>TOTAL</strong>
                            </td>
                            <td>{quantityTotal}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Within each variation, show all the views of the product, and render the views based on the cart data */}

                  <div className={styles["variation-views-container"]}>
                    {variation.views.map((view) => {
                      const viewFromDb = variationFromDb?.views.find(
                        (dbView) => dbView.id === view.id
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
