"use server";

import { env } from "@/env";
import { sendEmail } from "@/utility/mail";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export async function submitFeedback(data: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  feedback: string;
}) {
  try {
    const templateSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/customizer/mail/feedbackEmail.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(templateSource);
    const message = template(data);

    await sendEmail(
      env.CUSTOMIZER_FEEDBACK_DEST_EMAIL,
      "Visualizer Feedback",
      message
    );
  } catch (error) {
    console.error(
      "Received visualizer feedback, but failed to send the email notification!",
      error
    );
  }
}
