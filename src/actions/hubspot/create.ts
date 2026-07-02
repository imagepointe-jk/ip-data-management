"use server";

import {
  HUBSPOT_LEAD_TO_PRIMARY_COMPANY,
  HUBSPOT_LEAD_TO_PRIMARY_CONTACT,
  HUBSPOT_NOTE_TO_LEAD,
} from "@/constants";
import { env } from "@/env";

export async function createLead(data: {
  contactId: number;
  daLead: boolean;
  integrationActivityNotes: string;
  leadType: string;
  name: string;
  ownerId: number;
  stage: string;
  companyId?: number;
}) {
  const {
    companyId,
    contactId,
    daLead,
    integrationActivityNotes,
    leadType,
    name,
    ownerId,
    stage,
  } = data;

  const body = {
    properties: {
      hs_lead_name: name,
      integration_activity_notes: integrationActivityNotes,
      hs_lead_type: leadType,
      hs_pipeline_stage: stage,
      da_lead: daLead ? "true" : "false",
      hubspot_owner_id: ownerId,
    },
    associations: [
      {
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: HUBSPOT_LEAD_TO_PRIMARY_CONTACT,
          },
        ],
      },
    ],
  };

  if (companyId !== undefined) {
    body.associations.push({
      to: {
        id: companyId,
      },
      types: [
        {
          associationCategory: "HUBSPOT_DEFINED",
          associationTypeId: HUBSPOT_LEAD_TO_PRIMARY_COMPANY,
        },
      ],
    });
  }

  const response = await fetch("https://api.hubapi.com/crm/v3/objects/leads", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.HUBSPOT_INTEGRATION_ACCESS_TOKEN}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });

  const json = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    json,
  };
}

export async function addNoteToLead(data: {
  leadId: number;
  noteBody: string;
}) {
  const { leadId, noteBody } = data;

  const body = {
    properties: {
      hs_note_body: noteBody,
      hs_timestamp: new Date().toISOString(),
    },
    associations: [
      {
        to: {
          id: leadId,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: HUBSPOT_NOTE_TO_LEAD,
          },
        ],
      },
    ],
  };

  const response = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.HUBSPOT_INTEGRATION_ACCESS_TOKEN}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    ok: response.ok,
  };
}
