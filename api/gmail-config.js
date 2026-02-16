// Returns Gmail OAuth Client ID from environment variable
// so users don't have to manually paste it in the UI
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  res.json({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    configured: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
  });
}
