import { AppError } from "@/error";
import { normalizeObjectKeys } from "@/utility/misc";
import { getSheetFromBuffer, sheetToJson } from "@/utility/spreadsheet";
import { BAD_REQUEST } from "@/utility/statusCodes";
import { v4 as uuidv4 } from "uuid";
import { LeadSyncRow, LeadSyncRowResult } from "./types";
import { addNoteToLead, createLead } from "@/actions/hubspot/create";

export async function createLeadSyncRows(
  formData: FormData,
): Promise<LeadSyncRow[]> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new AppError({
      type: "Client Request",
      clientMessage: "Invalid or missing file.",
      serverMessage: "Invalid or missing file.",
      statusCode: BAD_REQUEST,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer));
  const json = sheetToJson(sheet);
  return validateLeadSheet(json);
}

function validateLeadSheet(json: any): LeadSyncRow[] {
  if (!Array.isArray(json)) throw new Error("Not an array");

  const parsed: LeadSyncRow[] = json.map((item, i) => {
    const rowId = uuidv4();
    const normalized = normalizeObjectKeys(item);
    const contactId = +`${normalized["contact id"]}`;
    if (isNaN(contactId)) {
      return {
        rowId,
        error: {
          message: `Invalid Contact ID at index ${i}`,
        },
      };
    }

    const companyIdVal = +`${normalized["company id"]}`;
    const companyId = isNaN(companyIdVal) ? undefined : companyIdVal;

    const nameVal = normalized["lead name"];
    if (!nameVal) {
      return {
        rowId,
        error: {
          message: `Missing lead name at index ${i}`,
        },
      };
    }

    const daLead = normalized["da lead"] === "yes";
    const integrationActivityNotes = `${normalized["integration activity notes"]}`;
    const leadType = `${normalized["lead type"]}`;
    const stage = `${normalized["lead stage"]}`;
    const noteBody = `${normalized["note to attach"]}`;
    const ownerId = +`${normalized["lead owner id"]}`;
    if (!ownerId) {
      return {
        rowId,
        error: {
          message: `Invalid owner ID at index ${i}`,
        },
      };
    }

    const parsedItem: LeadSyncRow = {
      rowId,
      data: {
        contactId,
        companyId,
        name: nameVal,
        daLead,
        integrationActivityNotes,
        leadType,
        ownerId,
        stage,
        noteBody,
      },
    };

    return parsedItem;
  });

  return parsed;
}

export async function syncRow(row: LeadSyncRow): Promise<LeadSyncRowResult> {
  const { rowId, data } = row;

  if (!data) {
    return {
      rowId,
      contactId: 0,
      message: "No data",
      success: false,
    };
  }

  const {
    json: leadJson,
    ok: leadOk,
    status: leadStatus,
  } = await createLead(data);

  if (!leadOk) {
    return {
      rowId,
      contactId: data.contactId,
      message: `The API returned a ${leadStatus} status when creating the lead`,
      success: false,
    };
  }

  const leadId = +`${leadJson.id}`;
  if (isNaN(leadId)) {
    return {
      rowId,
      contactId: data.contactId,
      message: "Something went wrong with creating the lead",
      success: false,
    };
  }

  const { ok: noteOk, status: noteStatus } = await addNoteToLead({
    leadId,
    noteBody: data.noteBody,
  });
  if (!noteOk) {
    return {
      rowId,
      contactId: data.contactId,
      message: `The API returned a ${noteStatus} status when attaching the note to the lead`,
      success: false,
    };
  }

  return {
    rowId,
    contactId: data.contactId,
    message: "Data uploaded",
    success: true,
  };
}
