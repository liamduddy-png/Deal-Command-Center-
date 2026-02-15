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
    throw new Error(await res.text());
  }

  return res.json();
}
