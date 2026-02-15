// READ-ONLY: Fetch HubSpot deal by ID or company name
// Returns deal properties, associated contacts, last 5 engagements
// NEVER writes to HubSpot

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

    const contacts = await Promise.all(
      ids.map(async (id) => {
        try {
          return await hubspotFetch(
            `/crm/v3/objects/contacts/${id}?properties=firstname,lastname,email,jobtitle,phone,hs_lead_status,lifecyclestage,notes_last_updated,hs_email_last_reply_date,hs_email_last_open_date`
          );
        } catch {
          return null;
        }
      })
    );
    return contacts.filter(Boolean);
  } catch {
    return [];
  }
}

async function getEngagements(dealId) {
  try {
    const assocData = await hubspotFetch(
      `/crm/v4/objects/deals/${dealId}/associations/engagements`
    );
    const ids = (assocData.results || []).slice(0, 15).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    const engagements = await Promise.all(
      ids.map(async (id) => {
        try {
          const eng = await hubspotFetch(`/engagements/v1/engagements/${id}`);
          const meta = eng.metadata || {};
          return {
            type: eng.engagement?.type,
            timestamp: eng.engagement?.timestamp,
            createdAt: eng.engagement?.createdAt,
            body: (meta.body || meta.text || "").substring(0, 800),
            subject: meta.subject || "",
            from: meta.from?.email || "",
            to: (meta.to || []).map((t) => t.email).join(", "),
            title: meta.title || "",
            disposition: meta.disposition || "",
            durationMs: meta.durationMilliseconds || 0,
          };
        } catch {
          return null;
        }
      })
    );
    return engagements
      .filter(Boolean)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
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
