import nodemailer from "nodemailer";
import Mail, { Attachment } from "nodemailer/lib/mailer";
import fs from "fs";
import handlebars from "handlebars";
import { AppError } from "@/error";
import { DataError, SyncError, SyncWarning } from "@/processes/hubspot/error";
import { dataToSheetBuffer } from "./spreadsheet";
import { QuoteRequest } from "@/types/schema/designs";

export async function sendEmail(
  recipientAddress: string,
  subject: string,
  message: string,
  attachments?: Attachment[],
  useRawMessage?: boolean
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

  const modifiedMessage = message.replace(/\r|\r\n|\n/g, "<br>");

  const email: Mail.Options = {
    from: fromAddress,
    to: recipientAddress,
    subject,
    html: useRawMessage !== true ? modifiedMessage : message,
    attachments,
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

export function sendIssuesSheet(
  issues: (DataError | SyncError | SyncWarning)[]
) {
  const rows: {
    errorType: string;
    dataType?: string;
    message?: string;
    ["rowNumber (approx)"]?: number;
    rowIdentifier?: string;
    severity: "Error" | "Warning";
    statusCode?: number;
    responseJsonString?: string;
  }[] = [];

  for (const issue of issues) {
    if (issue instanceof DataError) {
      rows.push({
        errorType: "Data",
        dataType: issue.type,
        message: issue.message,
        rowIdentifier: issue.rowIdentifier,
        ["rowNumber (approx)"]: issue.rowNumber,
        severity: "Error",
      });
    } else if (issue instanceof SyncError) {
      rows.push({
        errorType: `Sync (${issue.type})`,
        dataType: issue.resourceType,
        message: issue.message,
        statusCode: issue.statusCode,
        responseJsonString: issue.responseJsonString,
        severity: "Error",
      });
    } else if (issue instanceof SyncWarning) {
      rows.push({
        errorType: `Sync (${issue.type})`,
        severity: "Warning",
        message: issue.message,
      });
    }
  }

  const sheet = dataToSheetBuffer(rows, "Issues");
  sendEmail(
    "josh.klope@imagepointe.com",
    "HubSpot Sync Results",
    "Results of HubSpot sync",
    [{ content: sheet, filename: "issues.xlsx" }]
  );
}
