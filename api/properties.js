// READ-ONLY: Fetch all HubSpot deal properties for mapping setup

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

  if (!token) {
    return res.status(200).json([]);
  }

  const r = await fetch("https://api.hubapi.com/crm/v3/properties/deals", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await r.json();
  res.status(200).json(data.results);
}
