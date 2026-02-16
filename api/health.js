// Health check — visit /api/health in browser to verify config
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    ok: true,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasHubspotToken: !!process.env.HUBSPOT_PRIVATE_APP_TOKEN,
    hasGmailClientId: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    gmailClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY
      ? process.env.ANTHROPIC_API_KEY.substring(0, 7) + "..."
      : null,
    nodeVersion: process.version,
  });
}
