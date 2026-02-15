// Builds structured deal context from HubSpot data for Claude
// Takes raw HubSpot API responses and returns a clean context object

export function buildDealContext(deal, contacts, engagements) {
  const props = deal.properties || {};

  return {
    deal: {
      id: deal.id,
      name: props.dealname || "Unknown",
      amount: parseFloat(props.amount) || 0,
      stage: props.dealstage || "Unknown",
      closeDate: props.closedate ? props.closedate.split("T")[0] : null,
      pipeline: props.pipeline || null,
      probability: parseFloat(props.hs_deal_stage_probability) || 0,
      lastModified: props.hs_lastmodifieddate
        ? props.hs_lastmodifieddate.split("T")[0]
        : null,
      description: props.description || null,
    },
    contacts: (contacts || []).map((c) => ({
      name: [c.properties?.firstname, c.properties?.lastname]
        .filter(Boolean)
        .join(" ") || "Unknown",
      email: c.properties?.email || null,
      title: c.properties?.jobtitle || null,
      phone: c.properties?.phone || null,
    })),
    meddpicc: extractMeddpicc(props),
    gong: {
      link: props.gong_link || null,
      summary: props.gong_summary || props.gong_call_summary || null,
    },
    engagements: (engagements || []).slice(0, 5).map((eng) => ({
      type: eng.type || "NOTE",
      date: eng.timestamp
        ? new Date(eng.timestamp).toISOString().split("T")[0]
        : null,
      subject: eng.subject || eng.title || "",
      preview: (eng.body || "").substring(0, 300),
    })),
  };
}

function extractMeddpicc(props) {
  const fields = {};
  const keys = [
    "metrics",
    "economic_buyer",
    "decision_criteria",
    "decision_process",
    "identify_pain",
    "champion",
    "competition",
    "paper_process",
  ];
  for (const key of keys) {
    const val = props[`meddpicc_${key}`] || props[key] || null;
    if (val && val.trim()) fields[key] = val.trim();
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

export function formatContextForPrompt(context) {
  let text = `## Deal: ${context.deal.name}\n`;
  text += `Amount: $${context.deal.amount.toLocaleString()}\n`;
  text += `Stage: ${context.deal.stage}\n`;
  if (context.deal.closeDate) text += `Close Date: ${context.deal.closeDate}\n`;
  if (context.deal.probability) text += `Probability: ${context.deal.probability}%\n`;
  text += "\n";

  if (context.contacts.length > 0) {
    text += `### Contacts\n`;
    for (const c of context.contacts) {
      text += `- ${c.name}`;
      if (c.title) text += ` (${c.title})`;
      if (c.email) text += ` — ${c.email}`;
      text += "\n";
    }
    text += "\n";
  }

  if (context.meddpicc) {
    text += `### MEDDPICC\n`;
    for (const [key, val] of Object.entries(context.meddpicc)) {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      text += `- **${label}:** ${val}\n`;
    }
    text += "\n";
  }

  if (context.gong.summary) {
    text += `### Gong Intelligence\n${context.gong.summary}\n\n`;
  }

  if (context.engagements.length > 0) {
    text += `### Recent Activity\n`;
    for (const e of context.engagements) {
      text += `[${e.date || "?"}] ${e.type}: ${e.subject || e.preview}\n`;
    }
    text += "\n";
  }

  return text;
}
