// READ-ONLY HubSpot integration
// Fetches deals, MEDDPICC fields, activity, and Gong call summaries
// NEVER writes or pushes data back to HubSpot

export const config = { maxDuration: 30 };

import { hubspotFetch } from "../lib/hubspot.js";

const DEAL_PROPERTIES = [
  "dealname", "amount", "dealstage", "closedate", "pipeline",
  "hubspot_owner_id", "hs_lastmodifieddate", "hs_deal_stage_probability",
  "notes_last_updated", "num_associated_contacts",
  "meddpicc_metrics", "meddpicc_economic_buyer", "meddpicc_decision_criteria",
  "meddpicc_decision_process", "meddpicc_identify_pain", "meddpicc_champion",
  "meddpicc_competition", "meddpicc_paper_process",
  "metrics", "economic_buyer", "decision_criteria",
  "decision_process", "identify_pain", "champion", "competition",
  "gong_link", "gong_summary", "gong_call_summary",
].join(",");

async function getDealEngagements(dealId) {
  try {
    const data = await hubspotFetch(
      `/crm/v4/objects/deals/${dealId}/associations/engagements`
    );
    const ids = (data.results || []).slice(0, 10).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    const engagements = await Promise.all(
      ids.map(async (id) => {
        try {
          const eng = await hubspotFetch(`/engagements/v1/engagements/${id}`);
          return {
            type: eng.engagement?.type,
            timestamp: eng.engagement?.timestamp,
            body: (eng.metadata?.body || eng.metadata?.text || "").substring(0, 500),
            subject: eng.metadata?.subject || "",
          };
        } catch {
          return null;
        }
      })
    );
    return engagements.filter(Boolean).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch {
    return [];
  }
}

async function getGongNotes(dealId) {
  try {
    const data = await hubspotFetch(
      `/crm/v3/objects/deals/${dealId}/associations/notes`
    );
    const ids = (data.results || []).slice(0, 5).map((r) => r.id || r.toObjectId);
    if (ids.length === 0) return [];

    const notes = await Promise.all(
      ids.map(async (id) => {
        try {
          const note = await hubspotFetch(
            `/crm/v3/objects/notes/${id}?properties=hs_note_body,hs_timestamp`
          );
          const body = note.properties?.hs_note_body || "";
          if (
            body.toLowerCase().includes("gong") ||
            body.toLowerCase().includes("call summary") ||
            body.toLowerCase().includes("recording")
          ) {
            return { timestamp: note.properties?.hs_timestamp, body: body.substring(0, 1000) };
          }
          return null;
        } catch {
          return null;
        }
      })
    );
    return notes.filter(Boolean);
  } catch {
    return [];
  }
}

function mapDealHealth(stage, probability) {
  const prob = parseFloat(probability) || 0;
  if (prob >= 0.7) return "hot";
  if (prob >= 0.3) return "warm";
  return "cold";
}

function extractMeddpicc(props) {
  const fields = {};
  const keys = [
    "metrics", "economic_buyer", "decision_criteria",
    "decision_process", "identify_pain", "champion", "competition", "paper_process",
  ];
  for (const key of keys) {
    const val = props[`meddpicc_${key}`] || props[key] || null;
    if (val) fields[key] = val;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

function formatLastActivity(dateStr) {
  if (!dateStr) return "Unknown";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
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

  try {
    const dealsData = await hubspotFetch(
      `/crm/v3/objects/deals?limit=50&properties=${DEAL_PROPERTIES}`
    );

    const deals = await Promise.all(
      (dealsData.results || []).map(async (deal) => {
        const props = deal.properties || {};

        const [engagements, gongNotes] = await Promise.all([
          getDealEngagements(deal.id),
          getGongNotes(deal.id),
        ]);

        const meddpicc = extractMeddpicc(props);

        return {
          id: parseInt(deal.id),
          company: props.dealname || "Unknown",
          contact: props.num_associated_contacts
            ? `${props.num_associated_contacts} contacts`
            : "No contacts",
          amount: parseFloat(props.amount) || 0,
          stage: props.dealstage || "Unknown",
          closeDate: props.closedate ? props.closedate.split("T")[0] : null,
          health: mapDealHealth(props.dealstage, props.hs_deal_stage_probability),
          lastActivity: formatLastActivity(props.hs_lastmodifieddate),
          type: "pipeline",
          ms: {
            change: meddpicc?.champion ? "committed" : null,
            technical: meddpicc?.decision_criteria ? "eval" : null,
            pricing: meddpicc?.metrics ? "aware" : null,
            commercial: meddpicc?.economic_buyer ? "nda" : null,
            security: meddpicc?.paper_process ? "started" : null,
          },
          meddpicc,
          gong: {
            link: props.gong_link || props.gong_summary || null,
            notes: gongNotes,
          },
          recentActivity: engagements.slice(0, 5),
        };
      })
    );

    return res.status(200).json({ deals, count: deals.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
