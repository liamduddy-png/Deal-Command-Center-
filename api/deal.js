// READ-ONLY: Fetch HubSpot deal by ID or company name
// Returns deal properties, associated contacts, last 5 engagements
// NEVER writes to HubSpot

export const config = { maxDuration: 30 };

import { hubspotFetch } from "../lib/hubspot.js";
import { buildDealContext } from "../lib/context-builder.js";

const DEAL_PROPERTIES = [
  // Core deal fields
  "dealname", "amount", "dealstage", "closedate", "pipeline",
  "hubspot_owner_id", "hs_lastmodifieddate", "hs_deal_stage_probability",
  "notes_last_updated", "num_associated_contacts", "description",
  // Historical signals
  "hs_date_entered_closedwon", "hs_date_entered_closedlost",
  "hs_date_entered_appointmentscheduled", "hs_date_entered_qualifiedtobuy",
  "hs_date_entered_presentationscheduled", "hs_date_entered_decisionmakerboughtin",
  "hs_date_entered_contractsent",
  "createdate", "hs_lastmodifieddate",
  "hs_deal_stage_probability",
  "hs_is_closed_won", "hs_is_closed",
  "amount_in_home_currency",
  // MEDDPICC fields (both prefixed and unprefixed)
  "meddpicc_metrics", "meddpicc_economic_buyer", "meddpicc_decision_criteria",
  "meddpicc_decision_process", "meddpicc_identify_pain", "meddpicc_champion",
  "meddpicc_competition", "meddpicc_paper_process",
  "metrics", "economic_buyer", "decision_criteria",
  "decision_process", "identify_pain", "champion", "competition",
  // Milestone custom properties
  "change", "technical", "pricing", "commercial", "security", "executive",
  // Gong
  "gong_link", "gong_summary", "gong_call_summary",
  // Next step / risk
  "next_step", "hs_next_step", "risk", "compelling_event",
];

async function fetchDealById(dealId) {
  return hubspotFetch(
    `/crm/v3/objects/deals/${dealId}?properties=${DEAL_PROPERTIES.join(",")}`
  );
}

async function searchDealByName(companyName) {
  const data = await hubspotFetch(`/crm/v3/objects/deals/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "dealname",
          operator: "CONTAINS_TOKEN",
          value: companyName,
        }],
      }],
      properties: DEAL_PROPERTIES,
      limit: 5,
    }),
  });
  return data.results || [];
}

async function getAssociatedContacts(dealId) {
  try {
    const assocData = await hubspotFetch(
      `/crm/v4/objects/deals/${dealId}/associations/contacts`
    );
    const ids = (assocData.results || []).slice(0, 10).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    // Batch read contacts instead of individual fetches
    const batchData = await hubspotFetch(`/crm/v3/objects/contacts/batch/read`, {
      method: "POST",
      body: JSON.stringify({
        properties: [
          "firstname", "lastname", "email", "jobtitle", "phone",
          "hs_lead_status", "lifecyclestage", "notes_last_updated",
          "hs_email_last_reply_date", "hs_email_last_open_date",
        ],
        inputs: ids.map((id) => ({ id: String(id) })),
      }),
    });
    return batchData.results || [];
  } catch {
    return [];
  }
}

// Fetch engagement IDs for a specific type, then batch read properties
async function fetchEngagementType(dealId, objectType, properties) {
  try {
    const assocData = await hubspotFetch(
      `/crm/v4/objects/deals/${dealId}/associations/${objectType}`
    );
    const ids = (assocData.results || []).slice(0, 10).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    const batchData = await hubspotFetch(`/crm/v3/objects/${objectType}/batch/read`, {
      method: "POST",
      body: JSON.stringify({
        properties,
        inputs: ids.map((id) => ({ id: String(id) })),
      }),
    });
    return (batchData.results || []).map((r) => ({ ...r, _engType: objectType }));
  } catch {
    return [];
  }
}

async function getEngagements(dealId) {
  try {
    // Fetch all engagement types in parallel
    const [notes, calls, emails, meetings] = await Promise.all([
      fetchEngagementType(dealId, "notes", [
        "hs_timestamp", "hs_note_body",
      ]),
      fetchEngagementType(dealId, "calls", [
        "hs_timestamp", "hs_call_title", "hs_call_body",
        "hs_call_disposition", "hs_call_duration",
      ]),
      fetchEngagementType(dealId, "emails", [
        "hs_timestamp", "hs_email_subject", "hs_email_text",
        "hs_email_from_email", "hs_email_to_email",
      ]),
      fetchEngagementType(dealId, "meetings", [
        "hs_timestamp", "hs_meeting_title", "hs_meeting_body",
        "hs_meeting_start_time", "hs_meeting_end_time",
      ]),
    ]);

    // Normalize each type into a common format
    const all = [];

    for (const n of notes) {
      const p = n.properties || {};
      all.push({
        type: "NOTE",
        timestamp: p.hs_timestamp ? new Date(p.hs_timestamp).getTime() : 0,
        body: (p.hs_note_body || "").substring(0, 800),
        subject: "",
        from: "",
        to: "",
        title: "",
        disposition: "",
        durationMs: 0,
      });
    }

    for (const c of calls) {
      const p = c.properties || {};
      all.push({
        type: "CALL",
        timestamp: p.hs_timestamp ? new Date(p.hs_timestamp).getTime() : 0,
        body: (p.hs_call_body || "").substring(0, 800),
        subject: "",
        from: "",
        to: "",
        title: p.hs_call_title || "",
        disposition: p.hs_call_disposition || "",
        durationMs: parseInt(p.hs_call_duration) || 0,
      });
    }

    for (const e of emails) {
      const p = e.properties || {};
      all.push({
        type: "EMAIL",
        timestamp: p.hs_timestamp ? new Date(p.hs_timestamp).getTime() : 0,
        body: (p.hs_email_text || "").substring(0, 800),
        subject: p.hs_email_subject || "",
        from: p.hs_email_from_email || "",
        to: p.hs_email_to_email || "",
        title: "",
        disposition: "",
        durationMs: 0,
      });
    }

    for (const m of meetings) {
      const p = m.properties || {};
      all.push({
        type: "MEETING",
        timestamp: p.hs_timestamp ? new Date(p.hs_timestamp).getTime() : 0,
        body: (p.hs_meeting_body || "").substring(0, 800),
        subject: "",
        from: "",
        to: "",
        title: p.hs_meeting_title || "",
        disposition: "",
        durationMs: 0,
      });
    }

    // Sort descending by timestamp, return last 15
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 15);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return res.status(200).json({ available: false, reason: "HUBSPOT_PRIVATE_APP_TOKEN not configured" });
  }

  const dealId = req.query.id;
  const company = req.query.company;

  if (!dealId && !company) {
    return res.status(400).json({ error: "Missing ?id= or ?company= parameter" });
  }

  try {
    let deal;

    if (dealId) {
      // Direct lookup by deal ID (from pasted HubSpot URL)
      deal = await fetchDealById(dealId);
    } else {
      // Search by company name
      const results = await searchDealByName(company);
      if (results.length === 0) {
        return res.status(200).json({
          available: true,
          found: false,
          message: `No deals found matching "${company}"`,
        });
      }
      deal = results[0];
    }

    const id = deal.id;

    // Fetch contacts and engagements in parallel
    const [contacts, engagements] = await Promise.all([
      getAssociatedContacts(id),
      getEngagements(id),
    ]);

    // Build structured context
    const context = buildDealContext(deal, contacts, engagements);

    return res.status(200).json({
      available: true,
      found: true,
      dealId: id,
      context,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
