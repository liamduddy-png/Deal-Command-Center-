import { generateWithTools } from "../lib/claude.js";
import { hubspotFetch } from "../lib/hubspot.js";

const SYSTEM_INSTRUCTIONS = `
You are a sales execution engine for Trunk Tools, a construction technology platform.
Do not use internal sales jargon.
Never use the word "closure".
Always say "Trunk Tools".
Format forecast exactly as specified.
Blend motion + MEDDPICC risk.
Be direct, specific, and actionable.
Reference real data when provided.
Format output for easy copy/paste into emails, Slack, and decks.

YOU HAVE HUBSPOT ACCESS.
Before generating any output, use the search_deals tool to find the deal in HubSpot.
Then use get_deal_contacts and get_deal_engagements to pull full context.
Use this data to inform everything you write.

MILESTONE DERIVATION RULES — auto-derive from deal context:

CHANGE:
- Identify Pain vague or missing → "Not validated"
- Actively evaluating tools / committed to solving → "Committed"

TECHNICAL:
- Demo scheduled or in progress → "Eval"
- Demo done, technical validated, confirmed fit → "Fit"
- Verbal preference, validation complete → "Vendor of Choice"

PRICING:
- No pricing shared yet → "Not given"
- Pricing sent but not aligned / under review → "Aware"
- Reviewed, negotiating, aligned → "Closure"

PAPERWORK:
- NDA signed → "NDA"
- MSA in progress or sent → "MSA"

SECURITY:
- No security review started → "Not started"
- Questionnaire or security review underway → "Started"
- Security approved / cleared → "Complete"

POWER:
- Exec copied on email → "Awareness"
- Exec attending calls → "Involvement"
- Exec actively advocating → "Supportive"

MILESTONE OUTPUT FORMAT (always use this exact inline format):
Company – $Amount
Milestone: Change (Value), Technical (Value), Pricing (Value), Power (Value), Paperwork (Value)
Next Step: [specific action with date]
Risk: [specific gaps]

CONTEXT ANALYSIS:
1. MEDDPICC — analyze, flag gaps, rate strength
2. Activity — use recency, gaps, type breakdown for stall detection
3. Contacts — infer buying influence from titles, flag missing exec/DM access
4. Historical — days in pipeline, stale signals
5. Emails — detect who replied last, pricing/timeline keywords, sentiment
6. Gong calls — use call dates as timeline anchors. When engagements include calls with "[Gong" in title or "gong.io" in body, use those dates to establish what was discussed when. Factor call recency and content into all outputs.

Use ALL data automatically. Never ask the user to provide context.
Always account for dates and timeline in your outputs — reference when things happened, not just what happened.
`;

const ACTION_INSTRUCTIONS = {
  follow_up: `You are drafting a follow-up email.
First, use your HubSpot tools to find this deal and pull all context.
Adjust tone based on engagement recency, milestone stage, MEDDPICC gaps, and risk signals.
Do not mention internal terminology. Focus on workflow pain.`,

  ghost: `You are writing a re-engagement sequence for a deal that has gone dark.
First, use your HubSpot tools to find this deal and check last activity date.
Create 3 short emails spaced 3–5 days apart.
Each takes a different angle: value reminder, social proof, urgency.
Do not be pushy. Focus on the pain they originally expressed.`,

  gut_forecast: `You are writing a forecast block.
First, use your HubSpot tools to pull deal data, contacts, and engagements.
Auto-derive milestones from deal signals using the milestone derivation rules.
Output format:
Company – $Amount
Milestone: Change (Value), Technical (Value), Pricing (Value), Power (Value), Paperwork (Value)
Next Step: [specific action with date]
Risk: [specific gaps]
Then add a 1-line confidence narrative with close date.`,

  meeting_prep: `You are preparing a pre-call brief.
First, use your HubSpot tools to find this deal, contacts, and recent activity.
Include: attendees, their likely priorities, open questions to ask,
objections to prepare for, and the ideal meeting outcome.`,

  spin_deck: `You are creating a SPIN selling deck outline.
First, use your HubSpot tools to pull deal context and identify pain points.
Structure: Situation → Problem → Implication → Need-Payoff.
Use construction-specific language.`,

  meddpicc_review: `You are reviewing the MEDDPICC scorecard for this deal.
First, use your HubSpot tools to pull all MEDDPICC fields and recent activity.
For each element: Rate Strong / Developing / Gap, provide evidence, recommend action.
Then auto-derive milestones using the derivation rules and output the inline milestone block:
Company – $Amount
Milestone: Change (Value), Technical (Value), Pricing (Value), Power (Value), Paperwork (Value)
Next Step: [action with date]
Risk: [gaps]`,

  milestone_review: `You are auto-deriving milestone status.
First, use your HubSpot tools to pull deal properties, contacts, and engagements.
Use the milestone derivation rules to map signals to milestone values.
Output in this exact format:
Company – $Amount
Milestone: Change (Value), Technical (Value), Pricing (Value), Power (Value), Paperwork (Value)
Next Step: [specific action with date]
Risk: [specific gaps]
Be precise. Flag unknowns.`,

  call_track: `You are building a call framework.
First, use your HubSpot tools to pull contact and deal context.
Include: opening hook, discovery questions, value props, competitive positioning, close ask.`,

  research: `You are doing company research for a sales call.
First, use your HubSpot tools to see what's already known about this deal.
Cover: company size, construction verticals, technology stack, pain points.`,

  deal_story: `You are writing a deal narrative for leadership review.
First, use your HubSpot tools to pull full deal history and activity.
Cover: origin, champion journey, competitive dynamics, blockers, path to win.`,

  next_steps: `You are creating a prioritized list of next actions.
First, use your HubSpot tools to pull current deal state and activity.
Include owner, deadline, and impact level for each step.`,

  slack_update: `You are writing a Slack-style status update.
First, use your HubSpot tools to get the latest deal state.
Keep it under 4 lines: status, last action, next step with date, any blocker.`,

  expansion_path: `You are identifying upsell and expansion opportunities.
First, use your HubSpot tools to pull deal and contact context.
Analyze usage patterns, project pipeline, stakeholder relationships.
Recommend specific expansion plays with revenue estimates.`,

  risk_blockers: `You are assessing renewal risks and blockers.
First, use your HubSpot tools to pull deal context and activity.
For each risk: severity, likelihood, mitigation plan, and owner.`,

  renewal_prep: `You are preparing a renewal strategy.
First, use your HubSpot tools to pull deal and engagement data.
Cover: value delivered, expansion opportunities, competitive threats, pricing, timeline.`,

  health_check: `You are conducting a customer health assessment.
First, use your HubSpot tools to pull activity and engagement data.
Score: adoption, engagement, support, sentiment, alignment. Flag below threshold.`,

  champion_map: `You are mapping champion and stakeholder relationships.
First, use your HubSpot tools to pull all associated contacts.
Identify: champion, economic buyer, technical evaluator, blocker, coach.
Note relationship strength and actions for each.`,

  usage_report: `You are analyzing product usage patterns.
First, use your HubSpot tools to pull deal and contact context.
Highlight: active users, feature adoption, trends, deeper engagement opportunities.`,

  research_projects: `You are analyzing the customer's project pipeline.
First, use your HubSpot tools to pull deal context.
Identify projects where Trunk Tools adds value. Estimate expansion revenue.`,
};

// HubSpot tools that Claude can call
const HUBSPOT_TOOLS = [
  {
    name: "search_deals",
    description: "Search HubSpot for deals by company name. Returns deal properties including MEDDPICC fields, milestones, Gong summaries, amount, stage, close date, and pipeline status.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Company or deal name to search for",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_deal_contacts",
    description: "Get all contacts associated with a HubSpot deal. Returns name, email, title, phone, lead status, and email engagement dates for buying influence analysis.",
    input_schema: {
      type: "object",
      properties: {
        deal_id: {
          type: "string",
          description: "The HubSpot deal ID",
        },
      },
      required: ["deal_id"],
    },
  },
  {
    name: "get_deal_engagements",
    description: "Get recent engagements (emails, calls, meetings, notes) for a deal. Returns last 15 activities with type, timestamp, subject, body preview, sender, and recipients. Use this to detect activity gaps, who's engaging, and deal momentum.",
    input_schema: {
      type: "object",
      properties: {
        deal_id: {
          type: "string",
          description: "The HubSpot deal ID",
        },
      },
      required: ["deal_id"],
    },
  },
];

// Deal properties to fetch
const DEAL_PROPERTIES = [
  "dealname", "amount", "dealstage", "closedate", "pipeline",
  "hubspot_owner_id", "hs_lastmodifieddate", "hs_deal_stage_probability",
  "notes_last_updated", "num_associated_contacts", "description",
  "createdate", "hs_is_closed_won", "hs_is_closed",
  "meddpicc_metrics", "meddpicc_economic_buyer", "meddpicc_decision_criteria",
  "meddpicc_decision_process", "meddpicc_identify_pain", "meddpicc_champion",
  "meddpicc_competition", "meddpicc_paper_process",
  "metrics", "economic_buyer", "decision_criteria",
  "decision_process", "identify_pain", "champion", "competition",
  "change", "technical", "pricing", "commercial", "security", "executive",
  "gong_link", "gong_summary", "gong_call_summary",
  "next_step", "hs_next_step", "risk", "compelling_event",
];

// Execute HubSpot tool calls from Claude
async function executeToolCall(toolName, input) {
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    return { error: "HubSpot not configured" };
  }

  try {
    if (toolName === "search_deals") {
      const data = await hubspotFetch(`/crm/v3/objects/deals/search`, {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "dealname",
              operator: "CONTAINS_TOKEN",
              value: input.query,
            }],
          }],
          properties: DEAL_PROPERTIES,
          limit: 3,
        }),
      });
      return {
        deals: (data.results || []).map((d) => ({
          id: d.id,
          properties: d.properties,
        })),
      };
    }

    if (toolName === "get_deal_contacts") {
      const assocData = await hubspotFetch(
        `/crm/v4/objects/deals/${input.deal_id}/associations/contacts`
      );
      const ids = (assocData.results || []).slice(0, 10).map((r) => r.toObjectId);
      if (ids.length === 0) return { contacts: [] };

      const contacts = await Promise.all(
        ids.map(async (id) => {
          try {
            const c = await hubspotFetch(
              `/crm/v3/objects/contacts/${id}?properties=firstname,lastname,email,jobtitle,phone,hs_lead_status,lifecyclestage,hs_email_last_reply_date,hs_email_last_open_date`
            );
            return {
              id: c.id,
              name: [c.properties?.firstname, c.properties?.lastname].filter(Boolean).join(" "),
              email: c.properties?.email,
              title: c.properties?.jobtitle,
              phone: c.properties?.phone,
              lastReply: c.properties?.hs_email_last_reply_date,
              lastOpen: c.properties?.hs_email_last_open_date,
            };
          } catch {
            return null;
          }
        })
      );
      return { contacts: contacts.filter(Boolean) };
    }

    if (toolName === "get_deal_engagements") {
      const assocData = await hubspotFetch(
        `/crm/v4/objects/deals/${input.deal_id}/associations/engagements`
      );
      const ids = (assocData.results || []).slice(0, 15).map((r) => r.toObjectId);
      if (ids.length === 0) return { engagements: [] };

      const engagements = await Promise.all(
        ids.map(async (id) => {
          try {
            const eng = await hubspotFetch(`/engagements/v1/engagements/${id}`);
            const meta = eng.metadata || {};
            return {
              type: eng.engagement?.type,
              timestamp: eng.engagement?.timestamp,
              date: eng.engagement?.timestamp
                ? new Date(eng.engagement.timestamp).toISOString().split("T")[0]
                : null,
              subject: meta.subject || "",
              body: (meta.body || meta.text || "").substring(0, 500),
              from: meta.from?.email || "",
              to: (meta.to || []).map((t) => t.email).join(", "),
              title: meta.title || "",
              durationMin: meta.durationMilliseconds
                ? Math.round(meta.durationMilliseconds / 60000)
                : null,
            };
          } catch {
            return null;
          }
        })
      );
      return {
        engagements: engagements
          .filter(Boolean)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)),
      };
    }

    return { error: `Unknown tool: ${toolName}` };
  } catch (err) {
    return { error: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { type, context } = req.body;

  if (!type || !context) {
    return res.status(400).json({ error: "Missing type or context" });
  }

  const actionInstructions = ACTION_INSTRUCTIONS[type] || `Action: ${type}`;

  // Build prompt — Claude will use tools to fetch HubSpot data
  const prompt = `${actionInstructions}

Deal Context (from app):
${JSON.stringify(context, null, 2)}

Use your HubSpot tools to search for "${context.company}" and pull the latest deal data, contacts, and engagements before generating your response.`;

  // Determine which tools to provide
  const tools = process.env.HUBSPOT_PRIVATE_APP_TOKEN ? HUBSPOT_TOOLS : [];

  try {
    const output = await generateWithTools({
      system: SYSTEM_INSTRUCTIONS,
      prompt,
      tools,
      executeToolCall,
    });
    return res.status(200).json({ output });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
