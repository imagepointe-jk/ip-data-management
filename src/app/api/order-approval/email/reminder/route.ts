import { sendReminderEmails } from "@/actions/orderWorkflow/misc";
import { handleRequestError } from "../../../handleError";

export async function POST() {
  try {
    await sendReminderEmails();
    return Response.json({
      message: "Success",
    });
  } catch (error) {
    return handleRequestError(error);
  }
}
