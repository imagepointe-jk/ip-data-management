import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import fs from "fs";
import handlebars from "handlebars";
import { QuoteRequest } from "@/types/schema";
import { AppError } from "@/error";

async function sendEmail(
  recipientAddress: string,
  subject: string,
  message: string
) {
  const fromAddress = process.env.NODEMAILER_FROM_ADDRESS;
  const password = process.env.NODEMAILER_FROM_PASSWORD;
  if (!fromAddress || !password) {
    console.error("Missing env variables for nodemailer");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: fromAddress,
      pass: password,
    },
  });
  const email: Mail.Options = {
    from: fromAddress,
    to: recipientAddress,
    subject,
    html: message,
  };
  return transporter.sendMail(email);
}

export async function sendQuoteRequestEmail(quoteRequest: QuoteRequest) {
  const salesEmail = process.env.QUOTE_REQUEST_DEST_EMAIL;
  if (!salesEmail) {
    throw new Error("Missing sales email!");
  }

  try {
    const templateSource = fs.readFileSync(
      "./src/utility/quoteRequestEmail.hbs",
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template(quoteRequest);

    await sendEmail(salesEmail, "New Design Quote Request", message);
    console.log(`Successfully sent an email to ${salesEmail}`);
  } catch (error) {
    console.error("Failed to send a quote request!", quoteRequest);
    throw new AppError({
      type: "Unknown",
      serverMessage: (error as Error).message,
    });
  }
}
