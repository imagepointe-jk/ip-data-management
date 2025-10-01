import { sendReminderEmails } from "@/actions/orderWorkflow/misc";
import { handleRequestError } from "../../../handleError";

export async function POST() {
  try {
    //this is currently slow to respond due to needing to fetch data for every outstanding order via api.
    //will probably need to rework once we start scaling.
    await sendReminderEmails();
    return Response.json({
      message: "Success",
    });
  } catch (error) {
    return handleRequestError(error);
  }
}
