export async function deepResearch(companyName, context = {}) {
  const token = process.env.PERPLEXITY_API_KEY;
  if (!token) throw new Error("PERPLEXITY_API_KEY not configured");

  const prompt = buildResearchPrompt(companyName, context);

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar-pro",
      messages: [
        {
          role: "system",
          content: `You are a sales intelligence researcher for a construction technology company (Trunk Tools). Your job is to find actionable intelligence that helps an AE prepare for sales conversations. Be specific — names, dates, dollar amounts, project names. Cite sources. No fluff.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      return_citations: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || [];

  return { answer, citations };
}

function buildResearchPrompt(companyName, context) {
  const parts = [`Deep research on "${companyName}" for sales preparation.`];

  if (context.stage) parts.push(`Deal stage: ${context.stage}`);
  if (context.amount) parts.push(`Deal size: $${context.amount.toLocaleString()}`);
  if (context.contacts?.length > 0) {
    const names = context.contacts.map((c) => c.name || c.email).filter(Boolean);
    if (names.length > 0) parts.push(`Key contacts: ${names.join(", ")}`);
  }

  parts.push(`
Research the following and provide SPECIFIC, CURRENT findings:

1. RECENT NEWS & ANNOUNCEMENTS
   - Press releases, funding rounds, acquisitions, leadership changes
   - Any news from the last 6 months

2. UPCOMING & ACTIVE PROJECTS
   - Construction projects they are bidding on, awarded, or building
   - Project names, locations, dollar values, timelines
   - Check construction databases, permits, bid postings

3. JOB POSTINGS & HIRING SIGNALS
   - Open roles (especially field ops, technology, project management)
   - What their hiring says about growth or pain points
   - New office locations or expansion signals

4. TECHNOLOGY & OPERATIONS
   - What construction software they currently use (Procore, Bluebeam, PlanGrid, etc.)
   - Any digital transformation initiatives
   - Pain points mentioned in reviews or articles

5. FINANCIAL & COMPETITIVE INTEL
   - Revenue estimates, project backlog, bonding capacity
   - Key competitors and market position
   - Recent wins or losses

6. KEY PEOPLE & ORG STRUCTURE
   - C-suite and VP-level leadership
   - Technology decision-makers
   - Recent executive hires or departures

Format each section with specific findings. Include dates and source context. Flag anything that creates a sales opening for construction technology.`);

  return parts.join("\n");
}
