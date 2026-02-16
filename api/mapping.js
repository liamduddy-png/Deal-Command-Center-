// Stores/retrieves HubSpot property mapping using Vercel KV
// One-time setup: maps MEDDPICC + milestone fields to HubSpot property names

const KEY = "hubspot_property_mapping_v1";

// In-memory fallback when Vercel KV is not configured
let memoryStore = null;

async function getKv() {
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const kv = await getKv();

  if (req.method === "GET") {
    if (kv) {
      const mapping = await kv.get(KEY);
      return res.status(200).json(mapping || null);
    }
    return res.status(200).json(memoryStore);
  }

  if (req.method === "POST") {
    if (kv) {
      await kv.set(KEY, req.body);
    } else {
      memoryStore = req.body;
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
