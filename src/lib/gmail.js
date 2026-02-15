// Gmail client — browser-side OAuth2 via Google Identity Services
// Searches and fetches emails to/from deal contacts

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const TOKEN_KEY = "gmail_access_token";
const CLIENT_ID_KEY = "gmail_client_id";

let tokenClient = null;
let pendingResolve = null;

// Get stored client ID
export function getStoredClientId() {
  return localStorage.getItem(CLIENT_ID_KEY) || "";
}

// Save client ID
export function setStoredClientId(clientId) {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

// Get stored access token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Check if connected (has token)
export function isGmailConnected() {
  return !!getToken();
}

// Initialize token client (call after GIS script loads)
function ensureTokenClient(clientId) {
  if (!clientId) throw new Error("Google Client ID required");
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services not loaded yet. Refresh and try again.");
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: GMAIL_SCOPE,
    callback: (response) => {
      if (response.error) {
        if (pendingResolve) pendingResolve(null);
        pendingResolve = null;
        return;
      }
      localStorage.setItem(TOKEN_KEY, response.access_token);
      if (pendingResolve) pendingResolve(response.access_token);
      pendingResolve = null;
    },
  });
}

// Trigger OAuth popup — returns access token or null
export function connectGmail(clientId) {
  return new Promise((resolve) => {
    try {
      ensureTokenClient(clientId);
      pendingResolve = resolve;
      tokenClient.requestAccessToken();
    } catch (err) {
      resolve(null);
      throw err;
    }
  });
}

// Disconnect — clear token
export function disconnectGmail() {
  const token = getToken();
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
  localStorage.removeItem(TOKEN_KEY);
  tokenClient = null;
}

// Gmail API fetch helper
async function gmailFetch(path, params = {}) {
  const token = getToken();
  if (!token) throw new Error("Gmail not connected");

  const url = new URL(`${GMAIL_API}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error("Gmail token expired. Please reconnect.");
  }
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status}`);
  }
  return res.json();
}

// Search for emails to/from a list of contact email addresses
export async function fetchEmailsForContacts(contactEmails) {
  if (!contactEmails || contactEmails.length === 0) return [];

  // Build Gmail search query: emails from OR to any of the contacts
  const parts = contactEmails.flatMap((email) => [
    `from:${email}`,
    `to:${email}`,
  ]);
  const query = parts.join(" OR ");

  // Search messages
  const searchResult = await gmailFetch("/messages", {
    q: query,
    maxResults: 20,
  });

  if (!searchResult.messages || searchResult.messages.length === 0) return [];

  // Fetch each message (metadata only for speed)
  const messages = await Promise.all(
    searchResult.messages.slice(0, 15).map(async (msg) => {
      try {
        const full = await gmailFetch(`/messages/${msg.id}`, {
          format: "metadata",
          metadataHeaders: "From,To,Subject,Date",
        });
        return parseGmailMessage(full);
      } catch {
        return null;
      }
    })
  );

  return messages.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
}

// Fetch full email body for a specific message
export async function fetchEmailBody(messageId) {
  const full = await gmailFetch(`/messages/${messageId}`, { format: "full" });
  return extractBody(full);
}

// Parse Gmail message metadata into a clean object
function parseGmailMessage(msg) {
  const headers = {};
  for (const h of msg.payload?.headers || []) {
    headers[h.name.toLowerCase()] = h.value;
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: headers.from || "",
    to: headers.to || "",
    subject: headers.subject || "(no subject)",
    date: headers.date || "",
    timestamp: parseInt(msg.internalDate) || 0,
    snippet: msg.snippet || "",
    labelIds: msg.labelIds || [],
    isSent: (msg.labelIds || []).includes("SENT"),
  };
}

// Extract plain text body from a full message
function extractBody(msg) {
  const payload = msg.payload;
  if (!payload) return "";

  // Simple single-part message
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Multipart — find text/plain
  const parts = payload.parts || [];
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return decodeBase64(part.body.data);
    }
  }

  // Fallback to first HTML part stripped of tags
  for (const part of parts) {
    if (part.mimeType === "text/html" && part.body?.data) {
      const html = decodeBase64(part.body.data);
      return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  // Nested multipart
  for (const part of parts) {
    if (part.parts) {
      for (const sub of part.parts) {
        if (sub.mimeType === "text/plain" && sub.body?.data) {
          return decodeBase64(sub.body.data);
        }
      }
    }
  }

  return msg.snippet || "";
}

// Decode base64url-encoded string
function decodeBase64(data) {
  try {
    const decoded = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    return decoded;
  } catch {
    return "";
  }
}
