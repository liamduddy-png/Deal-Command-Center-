// READ-ONLY: Fetch HubSpot context for a single deal by company name
// Returns activity timeline, MEDDPICC fields, Gong call summaries
// NEVER writes to HubSpot

const HUBSPOT_API = "https://api.hubapi.com";

const DEAL_PROPERTIES = [
  "dealname", "amount", "dealstage", "closedate", "pipeline",
  "hubspot_owner_id", "hs_lastmodifieddate", "hs_deal_stage_probability",
  "notes_last_updated", "num_associated_contacts", "description",
  // MEDDPICC
  "meddpicc_metrics", "meddpicc_economic_buyer", "meddpicc_decision_criteria",
  "meddpicc_decision_process", "meddpicc_identify_pain", "meddpicc_champion",
  "meddpicc_competition", "meddpicc_paper_process",
  "metrics", "economic_buyer", "decision_criteria",
  "decision_process", "identify_pain", "champion", "competition",
  // Gong
  "gong_link", "gong_summary", "gong_call_summary",
].join(",");

async function hubspotGet(path, token) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function searchDealByName(companyName, token) {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "dealname",
          operator: "CONTAINS_TOKEN",
          value: companyName,
        }],
      }],
      properties: DEAL_PROPERTIES.split(","),
      limit: 5,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot search ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function getDealEngagements(dealId, token) {
  try {
    const assocData = await hubspotGet(
      `/crm/v4/objects/deals/${dealId}/associations/engagements`,
      token
    );
    const ids = (assocData.results || []).slice(0, 15).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    const engagements = await Promise.all(
      ids.map(async (id) => {
        try {
          const eng = await hubspotGet(`/engagements/v1/engagements/${id}`, token);
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

async function getDealNotes(dealId, token) {
  try {
    const assocData = await hubspotGet(
      `/crm/v4/objects/deals/${dealId}/associations/notes`,
      token
    );
    const ids = (assocData.results || []).slice(0, 10).map((r) => r.toObjectId);
    if (ids.length === 0) return [];

    const notes = await Promise.all(
      ids.map(async (id) => {
        try {
          const note = await hubspotGet(
            `/crm/v3/objects/notes/${id}?properties=hs_note_body,hs_timestamp,hs_created_by`,
            token
          );
          return {
            timestamp: note.properties?.hs_timestamp,
            body: (note.properties?.hs_note_body || "").substring(0, 1000),
          };
        } catch {
          return null;
        }
      })
    );
    return notes.filter(Boolean).sort((a, b) => {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  } catch {
    return [];
  }
}

function extractMeddpicc(props) {
  const fields = {};
  const keys = [
    "metrics", "economic_buyer", "decision_criteria",
    "decision_process", "identify_pain", "champion", "competition", "paper_process",
  ];
  for (const key of keys) {
    const val = props[`meddpicc_${key}`] || props[key] || null;
    if (val && val.trim()) fields[key] = val.trim();
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

function formatEngagement(eng) {
  const date = eng.timestamp ? new Date(eng.timestamp).toISOString().split("T")[0] : "Unknown";
  const type = (eng.type || "NOTE").toUpperCase();

  if (type === "EMAIL") {
    return `[${date}] EMAIL: "${eng.subject}" from ${eng.from} to ${eng.to}\n${eng.body}`;
  }
  if (type === "CALL") {
    const dur = eng.durationMs ? Math.round(eng.durationMs / 60000) + " min" : "";
    return `[${date}] CALL: ${eng.title || "Call"} ${dur}\n${eng.body}`;
  }
  if (type === "MEETING") {
    return `[${date}] MEETING: ${eng.title || "Meeting"}\n${eng.body}`;
  }
  if (type === "TASK") {
    return `[${date}] TASK: ${eng.subject || eng.title || "Task"}\n${eng.body}`;
  }
  return `[${date}] ${type}: ${eng.subject || ""}\n${eng.body}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return res.status(200).json({ available: false, reason: "HUBSPOT_ACCESS_TOKEN not configured" });
  }

  const company = req.query.company;
  if (!company) {
    return res.status(400).json({ error: "Missing ?company= parameter" });
  }

  try {
    // Search for the deal by company name
    const searchResults = await searchDealByName(company, token);
    const deals = searchResults.results || [];

    if (deals.length === 0) {
      return res.status(200).json({
        available: true,
        found: false,
        company,
        message: `No deals found matching "${company}"`,
      });
    }

    // Use the best match (first result)
    const deal = deals[0];
    const props = deal.properties || {};
    const dealId = deal.id;

    // Fetch engagements and notes in parallel
    const [engagements, notes] = await Promise.all([
      getDealEngagements(dealId, token),
      getDealNotes(dealId, token),
    ]);

    const meddpicc = extractMeddpicc(props);

    // Separate Gong-related notes
    const gongNotes = notes.filter((n) => {
      const body = (n.body || "").toLowerCase();
      return body.includes("gong") || body.includes("call summary") ||
        body.includes("call recording") || body.includes("call brief");
    });

    const otherNotes = notes.filter((n) => {
      const body = (n.body || "").toLowerCase();
      return !(body.includes("gong") || body.includes("call summary") ||
        body.includes("call recording") || body.includes("call brief"));
    });

    // Build a text context block for Claude
    let contextBlock = `## HubSpot Deal Intelligence: ${props.dealname || company}\n\n`;

    // Deal properties
    contextBlock += `**Deal Stage:** ${props.dealstage || "N/A"}\n`;
    contextBlock += `**Amount:** $${parseFloat(props.amount || 0).toLocaleString()}\n`;
    contextBlock += `**Close Date:** ${props.closedate ? props.closedate.split("T")[0] : "N/A"}\n`;
    contextBlock += `**Last Modified:** ${props.hs_lastmodifieddate ? props.hs_lastmodifieddate.split("T")[0] : "N/A"}\n\n`;

    // MEDDPICC
    if (meddpicc) {
      contextBlock += `### MEDDPICC Fields\n`;
      for (const [key, val] of Object.entries(meddpicc)) {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        contextBlock += `- **${label}:** ${val}\n`;
      }
      contextBlock += "\n";
    }

    // Gong call summaries
    if (gongNotes.length > 0 || props.gong_summary || props.gong_call_summary) {
      contextBlock += `### Gong Call Intelligence\n`;
      if (props.gong_link) contextBlock += `Gong Link: ${props.gong_link}\n`;
      if (props.gong_summary) contextBlock += `Summary: ${props.gong_summary}\n`;
      if (props.gong_call_summary) contextBlock += `Call Summary: ${props.gong_call_summary}\n`;
      for (const note of gongNotes.slice(0, 3)) {
        contextBlock += `\n${note.body}\n`;
      }
      contextBlock += "\n";
    }

    // Recent activity
    if (engagements.length > 0) {
      contextBlock += `### Recent Activity (${engagements.length} engagements)\n`;
      for (const eng of engagements.slice(0, 8)) {
        contextBlock += formatEngagement(eng) + "\n\n";
      }
    }

    // Notes
    if (otherNotes.length > 0) {
      contextBlock += `### Notes\n`;
      for (const note of otherNotes.slice(0, 5)) {
        const date = note.timestamp ? new Date(note.timestamp).toISOString().split("T")[0] : "";
        contextBlock += `[${date}] ${note.body}\n\n`;
      }
    }

    return res.status(200).json({
      available: true,
      found: true,
      dealId,
      company: props.dealname,
      meddpicc,
      gong: {
        link: props.gong_link || null,
        summary: props.gong_summary || props.gong_call_summary || null,
        notes: gongNotes.slice(0, 3),
      },
      recentActivity: engagements.slice(0, 8).map((e) => ({
        type: e.type,
        date: e.timestamp ? new Date(e.timestamp).toISOString().split("T")[0] : null,
        subject: e.subject || e.title || "",
        preview: (e.body || "").substring(0, 200),
      })),
      notes: otherNotes.slice(0, 5).map((n) => ({
        date: n.timestamp ? new Date(n.timestamp).toISOString().split("T")[0] : null,
        preview: (n.body || "").substring(0, 200),
      })),
      contextBlock,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
