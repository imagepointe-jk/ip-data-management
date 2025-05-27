import { env } from "@/env";
import { QuoteRequestData } from "@/types/schema/customizer";
import { sendEmail } from "@/utility/mail";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export async function sendQuoteRequestEmail(
  quoteRequest: QuoteRequestData,
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
