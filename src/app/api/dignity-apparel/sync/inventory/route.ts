import { sendEmail } from "@/utility/mail";

export async function POST() {
  await sendEmail(
    "josh.klope@imagepointe.com",
    "Test Email",
    "The sync endpoint was hit."
  );
  return new Response();
}
