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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured. Add it to your Vercel environment variables." });
  }

  const { type, context } = req.body;

  if (!type || !context) {
    return res.status(400).json({ error: "Missing type or context" });
  }

  const prompt = `
${SYSTEM_INSTRUCTIONS}

Action Type: ${type}

Deal Context:
${JSON.stringify(context, null, 2)}
`;

  try {
    const output = await generateWithClaude(prompt);
    return res.status(200).json({ output });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
