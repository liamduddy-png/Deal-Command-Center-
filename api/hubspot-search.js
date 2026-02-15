// READ-ONLY: Search HubSpot deals by query
import { hubspotFetch } from "../lib/hubspot.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return res.status(500).json({ error: "HUBSPOT_ACCESS_TOKEN not configured" });
  }

  const { query } = req.body;

  const data = await hubspotFetch(`/crm/v3/objects/deals/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [],
      query,
      properties: ["dealname", "amount", "dealstage", "closedate"],
    }),
  });

  return res.status(200).json(data.results);
}
