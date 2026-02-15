// Builds structured deal context from HubSpot data for Claude
// Analyzes MEDDPICC, contacts, engagements, and historical signals

export function buildDealContext(deal, contacts, engagements) {
  const props = deal.properties || {};

  // Compute historical signals
  const now = Date.now();
  const created = props.createdate ? new Date(props.createdate).getTime() : null;
  const lastModified = props.hs_lastmodifieddate ? new Date(props.hs_lastmodifieddate).getTime() : null;
  const daysInPipeline = created ? Math.floor((now - created) / 86400000) : null;
  const daysSinceModified = lastModified ? Math.floor((now - lastModified) / 86400000) : null;

  // Engagement analysis
  const engagementAnalysis = analyzeEngagements(engagements);

  // Contact intelligence
  const contactIntel = analyzeContacts(contacts);

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
      nextStep: props.next_step || props.hs_next_step || null,
      risk: props.risk || null,
      compellingEvent: props.compelling_event || null,
    },
    // Historical signals for risk detection
    history: {
      daysInPipeline,
      daysSinceModified,
      createdDate: props.createdate ? props.createdate.split("T")[0] : null,
      isClosed: props.hs_is_closed === "true",
      isClosedWon: props.hs_is_closed_won === "true",
      staleSignal: daysSinceModified > 7 ? "stale" : daysSinceModified > 3 ? "cooling" : "active",
    },
    // Milestone properties (if stored as custom fields)
    milestones: {
      change: props.change || null,
      technical: props.technical || null,
      pricing: props.pricing || null,
      paperwork: props.commercial || null,
      security: props.security || null,
      power: props.executive || null,
    },
    // MEDDPICC — raw field values for Claude to analyze
    meddpicc: extractMeddpicc(props),
    // Contact intelligence
    contacts: contactIntel.contacts,
    contactSummary: contactIntel.summary,
    // Gong
    gong: {
      link: props.gong_link || null,
      summary: props.gong_summary || props.gong_call_summary || null,
    },
    // Engagement intelligence
    engagements: engagementAnalysis.recent,
    activitySummary: engagementAnalysis.summary,
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

function analyzeEngagements(engagements) {
  if (!engagements || engagements.length === 0) {
    return {
      recent: [],
      summary: {
        totalCount: 0,
        lastActivityDate: null,
        daysSinceLastActivity: null,
        activityByType: {},
        engagingContacts: [],
        silentGap: null,
        meetingScheduled: false,
      },
    };
  }

  const sorted = [...engagements].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const now = Date.now();
  const lastActivity = sorted[0]?.timestamp ? new Date(sorted[0].timestamp) : null;
  const daysSinceLast = lastActivity ? Math.floor((now - lastActivity.getTime()) / 86400000) : null;

  // Count by type
  const activityByType = {};
  const engagingEmails = new Set();
  let meetingScheduled = false;

  for (const eng of sorted) {
    const type = (eng.type || "OTHER").toUpperCase();
    activityByType[type] = (activityByType[type] || 0) + 1;
    if (type === "MEETING") meetingScheduled = true;
    if (eng.from) engagingEmails.add(eng.from);
    if (eng.to) eng.to.split(",").map((e) => e.trim()).filter(Boolean).forEach((e) => engagingEmails.add(e));
  }

  // Detect activity gaps (>5 day gaps between engagements)
  let maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = ((sorted[i].timestamp || 0) - (sorted[i + 1].timestamp || 0)) / 86400000;
    if (gap > maxGap) maxGap = gap;
  }

  return {
    recent: sorted.slice(0, 10).map((eng) => ({
      type: eng.type || "NOTE",
      date: eng.timestamp
        ? new Date(eng.timestamp).toISOString().split("T")[0]
        : null,
      subject: eng.subject || eng.title || "",
      preview: (eng.body || "").substring(0, 400),
      from: eng.from || null,
      to: eng.to || null,
      durationMin: eng.durationMs ? Math.round(eng.durationMs / 60000) : null,
    })),
    summary: {
      totalCount: sorted.length,
      lastActivityDate: lastActivity ? lastActivity.toISOString().split("T")[0] : null,
      daysSinceLastActivity: daysSinceLast,
      activityByType,
      engagingContacts: [...engagingEmails].slice(0, 10),
      maxActivityGapDays: Math.round(maxGap),
      meetingScheduled,
    },
  };
}

function analyzeContacts(contacts) {
  if (!contacts || contacts.length === 0) {
    return {
      contacts: [],
      summary: {
        totalCount: 0,
        multiThreadCount: 0,
        hasExecutive: false,
        hasTechnical: false,
        hasChampion: false,
        roles: [],
      },
    };
  }

  const contactList = contacts.map((c) => {
    const props = c.properties || {};
    const title = (props.jobtitle || "").toLowerCase();
    const name = [props.firstname, props.lastname].filter(Boolean).join(" ") || "Unknown";

    // Infer buying influence from title
    let influence = "unknown";
    if (title.match(/ceo|cto|cfo|coo|president|owner|founder|chief/)) {
      influence = "executive";
    } else if (title.match(/vp|vice president|director|head of/)) {
      influence = "decision_maker";
    } else if (title.match(/manager|lead|senior/)) {
      influence = "influencer";
    } else if (title.match(/engineer|developer|analyst|specialist|coordinator/)) {
      influence = "end_user";
    } else if (title.match(/pm|project manager|superintendent|foreman/)) {
      influence = "end_user";
    }

    // Check if contact is actively engaging
    const lastReply = props.hs_email_last_reply_date
      ? new Date(props.hs_email_last_reply_date)
      : null;
    const lastOpen = props.hs_email_last_open_date
      ? new Date(props.hs_email_last_open_date)
      : null;
    const isActive = lastReply && (Date.now() - lastReply.getTime()) < 14 * 86400000;

    return {
      name,
      email: props.email || null,
      title: props.jobtitle || null,
      phone: props.phone || null,
      influence,
      isActive: !!isActive,
      lastReplyDate: lastReply ? lastReply.toISOString().split("T")[0] : null,
    };
  });

  const hasExecutive = contactList.some((c) => c.influence === "executive");
  const hasDm = contactList.some((c) => c.influence === "decision_maker");
  const activeCount = contactList.filter((c) => c.isActive).length;

  return {
    contacts: contactList,
    summary: {
      totalCount: contactList.length,
      multiThreadCount: activeCount,
      hasExecutive,
      hasDecisionMaker: hasDm,
      roles: [...new Set(contactList.map((c) => c.influence).filter((i) => i !== "unknown"))],
    },
  };
}

export function formatContextForPrompt(context) {
  let text = `## Deal: ${context.deal.name}\n`;
  text += `Amount: $${context.deal.amount.toLocaleString()}\n`;
  text += `Stage: ${context.deal.stage}\n`;
  if (context.deal.closeDate) text += `Close Date: ${context.deal.closeDate}\n`;
  if (context.deal.probability) text += `Probability: ${context.deal.probability}%\n`;
  if (context.deal.nextStep) text += `Next Step: ${context.deal.nextStep}\n`;
  if (context.deal.risk) text += `Risk: ${context.deal.risk}\n`;
  text += "\n";

  if (context.history) {
    text += `### Historical Signals\n`;
    if (context.history.daysInPipeline != null) text += `Days in pipeline: ${context.history.daysInPipeline}\n`;
    if (context.history.daysSinceModified != null) text += `Days since last update: ${context.history.daysSinceModified}\n`;
    text += `Status: ${context.history.staleSignal}\n\n`;
  }

  if (context.contacts.length > 0) {
    text += `### Contacts (${context.contactSummary.totalCount})\n`;
    for (const c of context.contacts) {
      text += `- ${c.name}`;
      if (c.title) text += ` (${c.title})`;
      text += ` [${c.influence}]`;
      if (c.isActive) text += ` ACTIVE`;
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
    text += `### Recent Activity (${context.activitySummary.totalCount} total)\n`;
    text += `Last activity: ${context.activitySummary.lastActivityDate} (${context.activitySummary.daysSinceLastActivity} days ago)\n`;
    if (context.activitySummary.maxActivityGapDays > 5) {
      text += `Warning: max gap between activities: ${context.activitySummary.maxActivityGapDays} days\n`;
    }
    for (const e of context.engagements) {
      text += `[${e.date || "?"}] ${e.type}: ${e.subject || e.preview}\n`;
    }
    text += "\n";
  }

  return text;
}
