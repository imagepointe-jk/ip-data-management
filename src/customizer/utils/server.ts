import { PRODUCT_CUSTOMIZER_RENDER_RML_FOLDER_ID } from "@/constants";
import { AppError } from "@/error";
import { uploadMedia } from "@/fetch/wordpress";
import { prisma } from "@/prisma";
import { CartState } from "@/types/schema/customizer";
import { CustomProductRequest } from "@prisma/client";

export async function uploadQuoteRequestRender(file: File) {
  const response = await uploadMedia(
    file,
    PRODUCT_CUSTOMIZER_RENDER_RML_FOLDER_ID
  );

  if (!response.ok) {
    const wpError = await response
      .json()
      .then((json) => json.message)
      .catch(() => "(no WP error found)");
    throw new AppError({
      type: "Unknown",
      clientMessage: `Failed to upload render`,
      serverMessage: `Failed to upload render; WP error: ${wpError}`,
      statusCode: response.status,
    });
  }

  const json = await response.json();
  return {
    uploadedUrl: json.guid.rendered,
  };
}

export async function getNamesForQuoteRequestDesigns(cart: CartState) {
  const allDesignIds = cart.products.flatMap((product) =>
    product.variations.flatMap((variation) =>
      variation.views.flatMap((view) =>
        view.artworks.flatMap(
          (art) => art.identifiers.designIdentifiers?.designId || 0
        )
      )
    )
  );

  const designs = await prisma.design.findMany({
    where: {
      id: {
        in: allDesignIds,
      },
    },
  });

  return designs.map((design) => design.designNumber);
}
