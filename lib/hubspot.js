export async function hubspotFetch(url, options = {}) {
  const res = await fetch(`https://api.hubapi.com${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`HubSpot API error ${res.status}: ${body.substring(0, 200)}`);
    err.status = res.status;
    err.code = res.status === 401 ? "HUBSPOT_AUTH_FAILED"
      : res.status === 429 ? "HUBSPOT_RATE_LIMITED"
      : res.status === 404 ? "HUBSPOT_NOT_FOUND"
      : "HUBSPOT_ERROR";
    throw err;
  }

  return res.json();
}
