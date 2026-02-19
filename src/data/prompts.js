export function getPrompt(actionId, deal) {
  const amt = deal.amount || deal.arr || 0;
  const fmtAmt = "$" + amt.toLocaleString();

  const prompts = {
    follow_up: `Draft a concise, compelling follow-up email for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal value: ${fmtAmt}.
Industry: Construction technology. Style: Chris Voss — direct, empathetic, no fluff.
Include a clear call-to-action and reference their specific situation.`,

    ghost: `${deal.company} has gone dark. Last activity: ${deal.lastActivity}.
Draft a 3-email re-engagement sequence. Each email should escalate in urgency and approach:
1. Soft check-in with value add
2. Direct ask with social proof
3. Breakup email with door open
No desperation. Keep it professional and construction-industry relevant.`,

    gut_forecast: `Create a GUT forecast block for this deal:

Company: ${deal.company}
Deal Value: ${fmtAmt}
Stage: ${deal.stage || "N/A"}
Health: ${deal.health}
Close Date: ${deal.closeDate || "N/A"}

Format as:
- My forecast contribution
- Current milestone status
- Next step to advance
- Key risk factors
- Confidence level (High/Medium/Low)`,

    post_meeting: `Draft a post-meeting follow-up email for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal value: ${fmtAmt}.
Use the most recent meeting/call engagement data to reconstruct what was discussed.
Structure: What we heard → Where Trunk Tools fits → Resources (if any) → Proposed next step.
Tone: calm, professional, field-credible. No hype.`,

    meeting_prep: `Pre-call preparation brief for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal: ${fmtAmt}.
Provide:
1. Key questions to ask
2. Likely objections and responses
3. Desired meeting outcomes
4. Competitive intelligence to reference
5. Next milestone to propose`,

    spin_deck: `Create a SPIN Selling presentation deck for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Value: ${fmtAmt}. Contact: ${deal.contact}.
Industry: Construction technology.

Structure the deck using the SPIN framework:

**Situation** (2-3 slides)
- Their current state: how they manage field ops, project tracking, safety
- Team size, project volume, tech stack assumptions

**Problem** (2-3 slides)
- Pain points: manual processes, rework costs, schedule delays, safety incidents
- Cost of inaction with construction-specific metrics

**Implication** (2-3 slides)
- What happens if problems persist: margin erosion, talent loss, competitive disadvantage
- Quantify the impact for a company their size

**Need-Payoff** (3-4 slides)
- How Trunk Tools solves each problem
- ROI projections and payback period
- Case studies from similar construction companies
- Implementation timeline and next steps

Make it ready to present. Include suggested talking points for each slide.`,

    meddpicc_review: `Run a MEDDPICC qualification review for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Value: ${fmtAmt}. Contact: ${deal.contact}.
Close date: ${deal.closeDate || "N/A"}. Health: ${deal.health}.

Score each element (Red / Yellow / Green) and provide analysis:

**Metrics** - What quantifiable business outcomes are they trying to achieve?
**Economic Buyer** - Who controls the budget? Have we engaged them?
**Decision Criteria** - What factors will they use to make a decision?
**Decision Process** - What is the approval process and timeline?
**Identify Pain** - What is the compelling event or pain driving this?
**Champion** - Do we have an internal advocate? How strong?
**Competition** - Who else are they evaluating? What's our position?
**Paper Process** - Legal, procurement, security review status?

For each element:
1. Current status (R/Y/G)
2. Evidence supporting the rating
3. Specific actions to improve
4. Questions to ask in next meeting

End with an overall deal score and recommendation.`,

    call_track: `Build a call framework for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Goal: advance to next milestone.
Use Chris Voss negotiation techniques:
- Opening (calibrated questions)
- Discovery (labels, mirrors)
- Value proposition
- Objection handling
- Close (next steps commitment)`,

    research: `What should I know about ${deal.company} before my next interaction?
They are a construction company. Provide:
1. Likely pain points in their segment
2. Key decision-maker roles to engage
3. Industry trends affecting them
4. Smart questions to demonstrate expertise
5. Potential competitive threats`,

    deal_story: `Write the deal narrative for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Value: ${fmtAmt}. Contact: ${deal.contact}.
Close date: ${deal.closeDate || "N/A"}. Health: ${deal.health}.
Tell the story: how we got here, where we are, what needs to happen next.
Include key moments, blockers overcome, and the path to close.`,

    next_steps: `Provide 3-5 prioritized next steps for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Health: ${deal.health}. Last activity: ${deal.lastActivity || "N/A"}.
Rank by impact on advancing this deal. For each step:
- What to do
- Why it matters
- When to do it
- Expected outcome`,

    slack_update: `Write a brief Slack update for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Value: ${fmtAmt}. Health: ${deal.health}.
Format: 3-4 lines max. Include status, momentum indicator, and immediate next step.
Keep it punchy — this is for a sales team channel.`,

    expansion_path: `Expansion strategy for ${deal.company}.
Current ARR: ${fmtAmt}. Active projects: ${deal.projects || 0}.
Identify:
1. Upsell opportunities (more seats, features, projects)
2. Cross-sell potential
3. Expansion timeline and triggers
4. Key conversations to initiate
5. Revenue target and path to get there`,

    risk_blockers: `Risk assessment for ${deal.company}.
Health: ${deal.health}. Usage: ${deal.usage || "N/A"}.
Known risk: ${deal.risk || "None identified"}.
Analyze:
1. Immediate risks and severity
2. Leading indicators to watch
3. Mitigation strategies
4. Escalation triggers
5. Recommended actions this week`,

    research_projects: `Project pipeline analysis for ${deal.company}.
Current projects: ${deal.projects || 0}.
Research:
1. Upcoming construction projects they may have
2. Expansion opportunities per project
3. Cross-project deployment strategy
4. Revenue potential from project growth
5. Competitive risks at project level`,

    renewal_prep: `Renewal preparation for ${deal.company}.
Current ARR: ${fmtAmt}. Renewal date: ${deal.renewalDate || "N/A"}.
Usage level: ${deal.usage || "N/A"}.
Develop:
1. Renewal strategy and timeline
2. Value delivered summary
3. Price increase justification (if applicable)
4. Risk factors for churn
5. Expansion opportunity at renewal`,

    health_check: `Customer health assessment for ${deal.company}.
Usage: ${deal.usage || "N/A"}. Health: ${deal.health}.
Projects: ${deal.projects || 0}. Risk: ${deal.risk || "None"}.
Evaluate:
1. Overall health score and factors
2. Usage trends and engagement
3. Stakeholder sentiment
4. Support ticket patterns
5. Recommendations to improve health`,

    champion_map: `Relationship mapping for ${deal.company}.
Primary contact: ${deal.contact}.
Map out:
1. Champion (internal advocate)
2. Economic buyer (budget holder)
3. Technical evaluator
4. Potential blockers
5. Relationship building strategy for each`,

    usage_report: `Usage analysis for ${deal.company}.
Projects: ${deal.projects || 0}. Usage level: ${deal.usage || "N/A"}.
Analyze:
1. Which projects are actively using the platform
2. Underutilized features or projects
3. Power users vs. inactive users
4. Adoption improvement recommendations
5. Usage-based expansion triggers`,

    objection_handling: `Handle objections for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal value: ${fmtAmt}.
Health: ${deal.health}. Last activity: ${deal.lastActivity || "N/A"}.

Objection codes:
A — Timing
B — Competitor
C — AI skepticism / trust
D — Budget
E — Not a priority

Analyze the deal context and:
1. Identify the most likely objections based on deal stage, health, and activity
2. Provide one-sentence responses for each likely objection
3. Personalize using deal-specific context
4. Suggest follow-up actions`,

    account_research: `Account research for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal value: ${fmtAmt}.
Health: ${deal.health}. Close date: ${deal.closeDate || "N/A"}.

Run the Account Research Assistant:
1. Project types / regions / delivery model (confirmed facts only)
2. Operational friction by persona (based on contacts)
3. Tailored hooks for outreach
4. Recommended CTA

Only use confirmed facts. Never invent claims.`,
  };

  return prompts[actionId] || `Help me with ${deal.company}. Provide strategic sales guidance.`;
}
