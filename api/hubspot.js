// Fetch all open deals from HubSpot for the pipeline/expansion views
// Returns deals formatted for the app's pipeline rail

export const config = { maxDuration: 30 };

import { hubspotFetch } from "../lib/hubspot.js";

const DEAL_PROPERTIES = [
  "dealname", "amount", "dealstage", "closedate", "pipeline",
  "hubspot_owner_id", "hs_lastmodifieddate", "hs_deal_stage_probability",
  "num_associated_contacts", "description",
  "createdate", "hs_is_closed_won", "hs_is_closed",
  "change", "technical", "pricing", "commercial", "security",
  "next_step", "hs_next_step", "risk",
];

// Map HubSpot stage IDs to human-readable names
function formatStage(stage) {
  if (!stage) return "Unknown";
  // Common HubSpot default stage IDs
  const STAGE_MAP = {
    appointmentscheduled: "Appointment Scheduled",
    qualifiedtobuy: "Qualified to Buy",
    presentationscheduled: "Presentation Scheduled",
    decisionmakerboughtin: "Decision Maker Bought-In",
    contractsent: "Contract Sent",
    closedwon: "Closed Won",
    closedlost: "Closed Lost",
  };
  return STAGE_MAP[stage] || stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Infer deal health from probability and activity recency
function inferHealth(props) {
  const prob = parseFloat(props.hs_deal_stage_probability) || 0;
  const lastMod = props.hs_lastmodifieddate ? new Date(props.hs_lastmodifieddate) : null;
  const daysSinceMod = lastMod ? Math.floor((Date.now() - lastMod.getTime()) / 86400000) : 999;

  if (props.hs_is_closed === "true") return props.hs_is_closed_won === "true" ? "hot" : "cold";
  if (daysSinceMod > 14) return "cold";
  if (prob >= 0.7 || daysSinceMod <= 3) return "hot";
  if (prob >= 0.3) return "warm";
  return "cold";
}

// Determine if deal is pipeline or expansion type
function inferType(props) {
  const stage = (props.dealstage || "").toLowerCase();
  if (stage === "closedwon") return "expansion";
  return "pipeline";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return res.status(200).json({
      available: false,
      reason: "HUBSPOT_PRIVATE_APP_TOKEN not configured",
    });
  }

  try {
    // Fetch open deals (not closed lost) sorted by last modified
    const data = await hubspotFetch(`/crm/v3/objects/deals/search`, {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "hs_is_closed",
            operator: "NEQ",
            value: "true",
          }],
        }],
        properties: DEAL_PROPERTIES,
        sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
        limit: 100,
      }),
    });

    const deals = (data.results || []).map((d) => {
      const p = d.properties || {};
      const lastMod = p.hs_lastmodifieddate
        ? new Date(p.hs_lastmodifieddate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Unknown";

      return {
        id: parseInt(d.id),
        company: p.dealname || "Untitled Deal",
        contact: `${p.num_associated_contacts || 0} contacts`,
        amount: parseInt(p.amount) || 0,
        stage: formatStage(p.dealstage),
        closeDate: p.closedate
          ? new Date(p.closedate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "No date",
        health: inferHealth(p),
        lastActivity: lastMod,
        ms: {
          change: p.change || null,
          technical: p.technical || null,
          pricing: p.pricing || null,
          commercial: p.commercial || null,
          security: p.security || null,
        },
        type: inferType(p),
        arr: parseInt(p.amount) || 0,
        renewalDate: p.closedate
          ? new Date(p.closedate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : null,
      };
    });

    return res.status(200).json({
      available: true,
      deals,
      total: deals.length,
    });
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || "HUBSPOT_FETCH_FAILED";
    console.error(`[hubspot] ${code}:`, err.message);
    return res.status(status).json({
      error: { code, message: err.message },
    });
  }
}
