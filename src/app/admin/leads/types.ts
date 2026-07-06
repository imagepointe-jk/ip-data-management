export type LeadSyncRow = {
  rowId: string;
  status: "ready" | "processing" | "invalid" | "error" | "done";
  resultMessage?: string;
  data?: {
    contactId: number;
    companyId?: number;
    name: string;
    daLead: boolean;
    leadType: string;
    ownerId: number;
    integrationActivityNotes: string;
    stage: string;
    noteBody: string;
  };
};
export type LeadSyncRowResult = {
  rowId: string;
  contactId: number;
  success: boolean;
  message: string;
};
