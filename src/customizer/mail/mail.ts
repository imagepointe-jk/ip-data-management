import { env } from "@/env";
import {
  PopulatedProductSettings,
  QuoteRequestData,
} from "@/types/schema/customizer";
import { sendEmail } from "@/utility/mail";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export async function sendQuoteRequestEmail(
  quoteRequest: QuoteRequestData,
  productSettings: PopulatedProductSettings[],
  newLeadId: number
) {
  try {
    const templateSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/customizer/mail/quoteRequestEmail.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template({
      ...quoteRequest,
      adminLink: `${env.NEXT_PUBLIC_BASE_URL}/admin/customizer/leads/${newLeadId}`,
    });

    await sendEmail(env.QUOTE_REQUEST_DEST_EMAIL, "New Quote Request", message);
  } catch (error) {
    console.error(
      "Received a quote request, but failed to send the email notification!",
      error
    );
  }
}

function populateQuoteRequest(
  quoteRequest: QuoteRequestData,
  productSettings: PopulatedProductSettings[],
  newLeadId: number
) {
  //briefly ignore TS to stick in arbitrary data immediately before using sending to the email template
  for (const product of quoteRequest.cart.products) {
    const productDb = productSettings.find(
      (thisProduct) => thisProduct.id === product.id
    );
    const productName = productDb?.product?.name || "UNKNOWN PRODUCT";
    //@ts-expect-error: property "name" not recognized
    product.name = productName;
    for (const variation of product.variations) {
      const variationColor =
        productDb?.variations.find(
          (thisVariation) => thisVariation.id === variation.id
        )?.color.name || "UNKNOWN COLOR";
      //@ts-expect-error: property "colorName" not recognized
      variation.colorName = variationColor;
    }
  }
}
