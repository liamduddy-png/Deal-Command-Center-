import { generateWithClaude } from "../lib/claude.js";

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
`;

const ACTION_INSTRUCTIONS = {
  follow_up: `You are drafting a follow-up email.
Adjust tone based on:
- Engagement recency
- Milestone stage
- MEDDPICC gaps
- Risk signals
Do not mention internal terminology.
Focus on workflow pain.`,

  ghost: `You are writing a re-engagement sequence for a deal that has gone dark.
Create 3 short emails spaced 3–5 days apart.
Each email takes a different angle: value reminder, social proof, urgency.
Do not be pushy or guilt-trip. Focus on the pain they originally expressed.`,

  gut_forecast: `You are writing a GUT forecast block.
Format:
Company | Amount | Close Date | Confidence % | Key Risk | Next Step
Include a 1-line narrative for each deal.`,

  meeting_prep: `You are preparing a pre-call brief.
Include: attendees, their likely priorities, open questions to ask,
objections to prepare for, and the ideal meeting outcome.`,

  spin_deck: `You are creating a SPIN selling deck outline.
Structure: Situation → Problem → Implication → Need-Payoff.
Use construction-specific language. Reference real pain points from the deal context.`,

  meddpicc_review: `You are reviewing the MEDDPICC scorecard for this deal.
For each element (Metrics, Economic Buyer, Decision Criteria, Decision Process,
Identify Pain, Champion, Competition, Paper Process):
- Rate: Strong / Developing / Gap
- Provide evidence from deal context
- Recommend specific next action to strengthen`,

  call_track: `You are building a call framework.
Include: opening hook, discovery questions, value props to hit,
competitive positioning, and close/next-step ask.`,

  research: `You are doing company research for a sales call.
Cover: company size, recent news, construction verticals,
technology stack, and potential pain points for Trunk Tools to address.`,

  deal_story: `You are writing a deal narrative for leadership review.
Cover: how the deal originated, champion journey, competitive dynamics,
current blockers, and path to win.`,

  next_steps: `You are creating a prioritized list of next actions.
Include owner, deadline, and impact level for each step.
Focus on actions that move the deal forward, not busywork.`,

  slack_update: `You are writing a Slack-style status update.
Keep it under 4 lines. Include: deal status, last action taken,
next step with date, and any blocker.`,

  expansion_path: `You are identifying upsell and expansion opportunities.
Analyze usage patterns, project pipeline, and stakeholder relationships.
Recommend specific expansion plays with revenue estimates.`,

  risk_blockers: `You are assessing renewal risks and blockers.
For each risk: severity, likelihood, mitigation plan, and owner.`,

  renewal_prep: `You are preparing a renewal strategy.
Cover: current value delivered, expansion opportunities, competitive threats,
pricing strategy, and timeline.`,

  health_check: `You are conducting a customer health assessment.
Score across: adoption, engagement, support tickets, NPS/sentiment,
and strategic alignment. Flag any areas below threshold.`,

  champion_map: `You are mapping the champion and stakeholder relationships.
Identify: champion, economic buyer, technical evaluator, blocker, and coach.
Note relationship strength and recommended actions for each.`,

  usage_report: `You are analyzing product usage patterns.
Highlight: active users, feature adoption, usage trends,
and opportunities to drive deeper engagement.`,

  research_projects: `You are analyzing the customer's project pipeline.
Identify upcoming projects where Trunk Tools can add value.
Estimate potential expansion revenue.`,
};

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

  const prompt = `${SYSTEM_INSTRUCTIONS}

${actionInstructions}

Deal Context:
${JSON.stringify(context, null, 2)}`;

  try {
    const output = await generateWithClaude(prompt);
    return res.status(200).json({ output });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
