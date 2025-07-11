import { IMAGE_NOT_FOUND_URL } from "@/constants";
import { CustomProductDecorationLocationNumeric } from "@/db/access/customizer";
import {
  CartState,
  CartStateArtwork,
  CartStateProductLocation,
  CartStateProductVariation,
  CartStateProductView,
  CartStateText,
  PlacedObject,
  PopulatedProductSettings,
} from "@/types/schema/customizer";
import { v4 as uuidv4 } from "uuid";

export function createLocationFrameInlineStyles(
  location: CustomProductDecorationLocationNumeric
) {
  return {
    width: `${location.width * 100}%`,
    height: `${location.height * 100}%`,
    left: `${location.positionX * 100}%`,
    top: `${location.positionY * 100}%`,
    borderColor: `#${location.frameColor}`,
  };
}

export function createInitialState(
  products: PopulatedProductSettings[],
  initialProductId: number,
  initialVariationId: number
) {
  //this becomes the first product added to the user's cart
  //currently this just picks the first one from our customizer db
  //will eventually need to be whatever id was specified in the URL
  const initialProduct = products.find(
    (product) => product.wooCommerceId === initialProductId
  );
  if (!initialProduct) throw new Error("No initial product");

  const initialVariation = initialProduct.variations.find(
    (variation) => variation.id === initialVariationId
  );
  if (!initialVariation) throw new Error("No initial variation");

  const firstView = initialVariation.views[0];
  if (!firstView) throw new Error("No views");

  const firstLocation = firstView.locations[0];
  if (!firstLocation) throw new Error("No locations");

  const initialLocation: CartStateProductLocation = {
    id: firstLocation.id,
    artworks: [],
    texts: [],
  };
  const initialView: CartStateProductView = {
    id: firstView.id,
    artworks: [],
    texts: [],
    currentRenderUrl: IMAGE_NOT_FOUND_URL,
  };
  const initialVariationState: CartStateProductVariation = {
    id: initialVariation.id,
    views: [initialView],
    quantities: {
      "2xl": 0,
      "3xl": 0,
      "4xl": 0,
      "5xl": 0,
      "6xl": 0,
      l: 0,
      m: 0,
      s: 0,
      xl: 0,
    },
  };

  const initialDesignState: CartState = {
    products: [
      {
        id: initialProduct.id,
        name: initialProduct.product?.name || "PRODUCT_NOT_FOUND",
        variations: [
          {
            id: initialVariation.id,
            label: initialVariation.color.name,
            views: initialVariation.views.map((view) => ({
              id: view.id,
              label: view.name,
              artworks: [],
              texts: [],
              currentRenderUrl: view.imageUrl,
            })),
            quantities: {
              "2xl": 0,
              "3xl": 0,
              "4xl": 0,
              "5xl": 0,
              "6xl": 0,
              l: 0,
              m: 0,
              s: 0,
              xl: 0,
            },
          },
        ],
      },
    ],
    contactInfo: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      local: "",
      phone: "",
      comments: "",
    },
  };

  return {
    initialDesignState,
    initialProduct,
    initialVariation: initialVariationState,
    initialView,
    initialLocation,
  };
}

//each variation is treated as a separate cart item, so count the total variations of all products combined
export function countCartItems(cart: CartState) {
  return cart.products.flatMap((product) => product.variations).length;
}

//counts the total texts, artworks, etc. on a variation.
//if 0, the variation has no design.
export function countVariationDesignObjects(
  variation: CartStateProductVariation & { views: CartStateProductView[] }
) {
  let sum = 0;
  for (const view of variation.views) {
    sum += view.artworks.length + view.texts.length;
  }
  return sum;
}

export function cloneArtwork(artwork: CartStateArtwork): CartStateArtwork {
  return {
    identifiers: {
      designIdentifiers: artwork.identifiers.designIdentifiers
        ? {
            designId: artwork.identifiers.designIdentifiers.designId,
            variationId: artwork.identifiers.designIdentifiers.variationId,
          }
        : undefined,
    },
    imageUrl: artwork.imageUrl,
    objectData: cloneObjectData(artwork.objectData),
  };
}

export function cloneText(text: CartStateText): CartStateText {
  return {
    objectData: cloneObjectData(text.objectData),
    textData: {
      text: text.textData.text,
      style: text.textData.style
        ? {
            align: text.textData.style.align,
            fontFamily: text.textData.style.fontFamily,
            fontSize: text.textData.style.fontSize,
            fontStyle: text.textData.style.fontStyle,
            hexCode: text.textData.style.hexCode,
            strokeHexCode: text.textData.style.strokeHexCode,
            strokeWidth: text.textData.style.strokeWidth,
            textDecoration: text.textData.style.textDecoration,
          }
        : undefined,
    },
  };
}

function cloneObjectData(objectData: PlacedObject) {
  return {
    editorGuid: uuidv4(),
    positionNormalized: {
      x: objectData.positionNormalized.x,
      y: objectData.positionNormalized.y,
    },
    rotationDegrees: objectData.rotationDegrees,
    sizeNormalized: {
      x: objectData.sizeNormalized.x,
      y: objectData.sizeNormalized.y,
    },
  };
}
