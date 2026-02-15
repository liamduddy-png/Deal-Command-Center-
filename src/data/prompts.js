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

    meeting_prep: `Pre-call preparation brief for ${deal.company}.
Contact: ${deal.contact}. Stage: ${deal.stage || "N/A"}. Deal: ${fmtAmt}.
Provide:
1. Key questions to ask
2. Likely objections and responses
3. Desired meeting outcomes
4. Competitive intelligence to reference
5. Next milestone to propose`,

    deck_outline: `Create a presentation deck outline for ${deal.company}.
Stage: ${deal.stage || "N/A"}. Industry: Construction.
Structure:
1. Their pain points (construction-specific)
2. Trunk Tools solution mapping
3. ROI and value metrics
4. Implementation timeline
5. Social proof / case studies
6. Pricing and next steps`,

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
  };

  return prompts[actionId] || `Help me with ${deal.company}. Provide strategic sales guidance.`;
}
