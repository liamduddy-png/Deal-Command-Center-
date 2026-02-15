const HUBSPOT_API = "https://api.hubapi.com";

export async function hubspotFetch(path, options = {}) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN not configured");
  }

  const url = path.startsWith("http") ? path : `${HUBSPOT_API}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${res.status}: ${text.substring(0, 300)}`);
  }

  return res.json();
}
