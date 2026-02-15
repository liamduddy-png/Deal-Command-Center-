import { deepResearch } from "../lib/perplexity.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.PERPLEXITY_API_KEY) {
    return res.status(500).json({ error: "PERPLEXITY_API_KEY not configured. Add your Perplexity API key to environment variables." });
  }

  const { company, context } = req.body;

  if (!company) {
    return res.status(400).json({ error: "Missing company name" });
  }

  try {
    const { answer, citations } = await deepResearch(company, context || {});

    // Format citations as a sources section
    let output = answer;
    if (citations && citations.length > 0) {
      output += "\n\n---\n**Sources:**\n";
      citations.forEach((url, i) => {
        output += `${i + 1}. ${url}\n`;
      });
    }

    return res.status(200).json({ output });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Deep research failed" });
  }
}
