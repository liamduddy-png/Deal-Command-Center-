import { create } from "zustand";
import { PIPELINE_DEALS, EXPANSION_DEALS } from "../data/deals";
import { PIPELINE_ACTIONS, EXPANSION_ACTIONS } from "../data/actions";
import {
  connectGmail as gmailConnect,
  disconnectGmail as gmailDisconnect,
  isGmailConnected,
  fetchEmailsForContacts,
  fetchEmailBody,
  getStoredClientId,
  setStoredClientId,
} from "../lib/gmail";

// Extract deal ID from HubSpot URL
function extractDealId(url) {
  const dealMatch = url.match(/deal\/(\d+)/);
  if (dealMatch) return dealMatch[1];
  const recordMatch = url.match(/record\/0-3\/(\d+)/);
  if (recordMatch) return recordMatch[1];
  const fallback = url.match(/\/(\d{8,})/);
  return fallback ? fallback[1] : null;
}

// Auth persistence
const AUTH_KEY = "dcc_user";
function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// AI output history persistence
const AI_HISTORY_KEY = "dcc_ai_history";
function getStoredAiHistory() {
  try {
    const raw = localStorage.getItem(AI_HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveAiHistory(history) {
  try {
    // Keep only last 50 entries to prevent storage bloat
    const keys = Object.keys(history);
    if (keys.length > 50) {
      const sorted = keys.sort((a, b) => {
        const aLast = history[a][history[a].length - 1]?.timestamp || 0;
        const bLast = history[b][history[b].length - 1]?.timestamp || 0;
        return bLast - aLast;
      });
      const trimmed = {};
      sorted.slice(0, 50).forEach((k) => { trimmed[k] = history[k]; });
      localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(trimmed));
      return;
    }
    localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(history));
  } catch { /* storage full — ignore */ }
}

// Request deduplication — prevent duplicate API calls
let activeRequests = {};

// Fetch with retry for transient network errors
async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

const useStore = create((set, get) => ({
  // Auth state — auto-authenticated (no login gate)
  user: getStoredUser() || { name: "User", email: "" },
  authError: null,

  login: (user) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    set({ user, authError: null });
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("gmail_access_token");
    set({ user: null, gmailConnected: false, gmailEmails: [] });
  },

  // View state
  mode: "pipeline",
  search: "",
  selected: null,
  showAttack: false,
  showForecasting: false,

  // AI state
  activeAction: null,
  aiText: "",
  loading: false,

  // AI output history — keyed by deal company name
  aiHistory: getStoredAiHistory(),
  showHistory: false,

  // Demo / Live mode
  dataMode: "demo", // "demo" = static data, "live" = HubSpot

  // HubSpot deal context (fetched per-deal)
  dealContext: null,
  dealContextLoading: false,

  // HubSpot state (all deals)
  hubspotDeals: null,
  hubspotLoading: false,
  hubspotError: null,
  useHubspot: false,

  // Gmail state
  gmailConnected: isGmailConnected(),
  gmailClientId: getStoredClientId(),
  gmailEmails: [],
  gmailLoading: false,
  gmailError: null,
  gmailExpandedId: null,

  // Actions
  setMode: (mode) => set({ mode, search: "", showAttack: false, showForecasting: false, selected: null, activeAction: null, aiText: "", dealContext: null }),
  setSearch: (search) => set({ search }),
  toggleAttack: () => set((s) => ({ showAttack: !s.showAttack, showForecasting: false })),
  toggleForecasting: () => set((s) => ({ showForecasting: !s.showForecasting, showAttack: false })),
  toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),

  // Data mode toggle
  setDataMode: (dataMode) => {
    if (dataMode === "live") {
      set({ dataMode, useHubspot: true });
      get().fetchHubspotDeals();
    } else {
      set({ dataMode, useHubspot: false });
    }
  },

  selectDeal: (deal) => {
    set({ selected: deal, activeAction: null, aiText: "", loading: false, dealContext: null, dealContextLoading: true, gmailEmails: [], gmailExpandedId: null, showHistory: false });
    get().fetchDealContext(deal.company);
  },
  goBack: () => set({ selected: null, activeAction: null, aiText: "", loading: false, dealContext: null, gmailEmails: [], gmailExpandedId: null, showHistory: false }),

  // Load a saved AI output from history
  loadFromHistory: (entry) => {
    set({ aiText: entry.output, activeAction: entry.actionId });
  },

  // Clear history for a deal
  clearDealHistory: (company) => {
    const history = { ...get().aiHistory };
    delete history[company];
    saveAiHistory(history);
    set({ aiHistory: history });
  },

  // Load deal from pasted HubSpot URL
  loadDealFromUrl: async (url) => {
    const dealId = extractDealId(url);
    if (!dealId) {
      set({ aiText: "Could not extract deal ID from URL. Paste a HubSpot deal URL (e.g. .../deal/123456 or .../record/0-3/123456)" });
      return;
    }

    set({
      dealContextLoading: true,
      dealContext: null,
      activeAction: null,
      aiText: "",
      loading: false,
    });

    try {
      const res = await fetchWithRetry(`/api/deal?id=${dealId}`);
      if (!res.ok) {
        set({ dealContextLoading: false, aiText: "Failed to fetch deal from HubSpot" });
        return;
      }
      const data = await res.json();

      if (!data.found) {
        set({ dealContextLoading: false, aiText: "Deal not found in HubSpot" });
        return;
      }

      const ctx = data.context;
      const deal = {
        id: parseInt(data.dealId),
        company: ctx.deal.name,
        contact: ctx.contacts.length > 0
          ? ctx.contacts.map((c) => c.name).join(", ")
          : "No contacts",
        amount: ctx.deal.amount,
        stage: ctx.deal.stage,
        closeDate: ctx.deal.closeDate,
        health: ctx.deal.probability >= 0.7 ? "hot" : ctx.deal.probability >= 0.3 ? "warm" : "cold",
        lastActivity: ctx.deal.lastModified || "Unknown",
        ms: null,
        type: "pipeline",
      };

      set({
        selected: deal,
        dealContext: data,
        dealContextLoading: false,
      });
      if (isGmailConnected()) {
        get().fetchGmailEmails(deal, data);
      }
    } catch (err) {
      set({ dealContextLoading: false, aiText: "Error: " + err.message });
    }
  },

  getDeals: () => {
    const { mode, hubspotDeals, useHubspot } = get();
    if (useHubspot && hubspotDeals) {
      return mode === "pipeline"
        ? hubspotDeals.filter((d) => d.type === "pipeline")
        : hubspotDeals.filter((d) => d.type === "expansion");
    }
    return mode === "pipeline" ? PIPELINE_DEALS : EXPANSION_DEALS;
  },

  getFilteredDeals: () => {
    const { search } = get();
    const deals = get().getDeals();
    if (!search) return deals;
    const s = search.toLowerCase();
    return deals.filter(
      (d) =>
        d.company.toLowerCase().includes(s) ||
        (d.contact || "").toLowerCase().includes(s)
    );
  },

  getActions: () => {
    return get().mode === "pipeline" ? PIPELINE_ACTIONS : EXPANSION_ACTIONS;
  },

  getTotal: () => {
    return get().getFilteredDeals().reduce((sum, d) => sum + (d.amount || d.arr || 0), 0);
  },

  // Export pipeline to CSV
  exportToCSV: () => {
    const deals = get().getFilteredDeals();
    const mode = get().mode;
    const isPipeline = mode === "pipeline";

    const headers = isPipeline
      ? ["Company", "Contact", "Amount", "Stage", "Close Date", "Health", "Last Activity"]
      : ["Company", "Contact", "ARR", "Renewal Date", "Health", "Usage", "Risk", "Projects"];

    const rows = deals.map((d) =>
      isPipeline
        ? [d.company, d.contact, d.amount || 0, d.stage, d.closeDate, d.health, d.lastActivity]
        : [d.company, d.contact, d.arr || 0, d.renewalDate, d.health, d.usage, d.risk, d.projects]
    );

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Fetch HubSpot context for a single deal (by company name)
  fetchDealContext: async (companyName) => {
    try {
      const res = await fetchWithRetry(`/api/deal?company=${encodeURIComponent(companyName)}`);
      if (!res.ok) {
        set({ dealContextLoading: false });
        return;
      }
      const data = await res.json();
      set({ dealContext: data, dealContextLoading: false });
      const { selected } = get();
      if (selected && isGmailConnected()) {
        get().fetchGmailEmails(selected, data);
      }
    } catch {
      set({ dealContextLoading: false });
    }
  },

  // AI action with deduplication and rate limiting
  runAction: async (action) => {
    const { selected, dealContext, mode, gmailEmails, loading } = get();
    if (!selected) return;

    // Deduplication — prevent duplicate concurrent requests
    const requestKey = `${selected.company}:${action.id}`;
    if (loading || activeRequests[requestKey]) return;
    activeRequests[requestKey] = true;

    set({ activeAction: action.id, loading: true, aiText: "" });

    const hubspot = dealContext?.context || null;

    const context = {
      company: selected.company,
      contact: selected.contact,
      amount: selected.amount || selected.arr || 0,
      stage: selected.stage || null,
      closeDate: selected.closeDate || null,
      health: selected.health,
      lastActivity: selected.lastActivity || null,
      milestones: selected.ms || null,
      mode,
      arr: selected.arr || null,
      renewalDate: selected.renewalDate || null,
      usage: selected.usage || null,
      risk: selected.risk || null,
      projects: selected.projects || null,
      meddpicc: hubspot?.meddpicc || null,
      gong: hubspot?.gong || null,
      contacts: hubspot?.contacts || [],
      contactSummary: hubspot?.contactSummary || null,
      recentActivity: hubspot?.engagements || [],
      activitySummary: hubspot?.activitySummary || null,
      history: hubspot?.history || null,
      hubspotMilestones: hubspot?.milestones || null,
      nextStep: hubspot?.deal?.nextStep || null,
      dealRisk: hubspot?.deal?.risk || null,
      compellingEvent: hubspot?.deal?.compellingEvent || null,
      dealDescription: hubspot?.deal?.description || null,
      gmailEmails: gmailEmails.length > 0
        ? gmailEmails.map((e) => ({
            date: new Date(e.timestamp).toISOString().split("T")[0],
            from: e.from,
            to: e.to,
            subject: e.subject,
            snippet: e.snippet,
            body: e.body || null,
            direction: e.isSent ? "sent" : "received",
          }))
        : null,
    };

    try {
      const isDeepResearch = action.id === "deep_research";
      const endpoint = isDeepResearch ? "/api/deep-research" : "/api/generate";
      const body = isDeepResearch
        ? { company: selected.company, context }
        : { type: action.id, context };

      const res = await fetchWithRetry(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("HTTP " + res.status + ": " + errText.substring(0, 200));
      }

      const data = await res.json();

      if (data?.output) {
        // Save to AI history
        const aiHistory = { ...get().aiHistory };
        const key = selected.company;
        if (!aiHistory[key]) aiHistory[key] = [];
        aiHistory[key].unshift({
          actionId: action.id,
          actionLabel: action.label,
          output: data.output,
          timestamp: Date.now(),
        });
        // Keep last 10 per deal
        aiHistory[key] = aiHistory[key].slice(0, 10);
        saveAiHistory(aiHistory);

        set({ aiText: data.output, loading: false, aiHistory });
      } else if (data?.error) {
        set({ aiText: "API Error: " + (data.error.message || JSON.stringify(data.error)), loading: false });
      } else {
        set({ aiText: "Unexpected response format", loading: false });
      }
    } catch (err) {
      const msg = err.message === "Failed to fetch"
        ? "Could not reach the API server. The deployment may be restarting — wait a moment and try again."
        : err.message;
      set({ aiText: "Error: " + msg, loading: false });
    } finally {
      delete activeRequests[requestKey];
    }
  },

  // Gmail
  setGmailClientId: (clientId) => {
    setStoredClientId(clientId);
    set({ gmailClientId: clientId });
  },

  connectGmail: async () => {
    const { gmailClientId } = get();
    if (!gmailClientId) {
      set({ gmailError: "Enter your Google OAuth Client ID first" });
      return;
    }
    try {
      const token = await gmailConnect(gmailClientId);
      if (token) {
        set({ gmailConnected: true, gmailError: null });
        const { selected, dealContext } = get();
        if (selected) {
          get().fetchGmailEmails(selected, dealContext);
        }
      }
    } catch (err) {
      set({ gmailError: err.message });
    }
  },

  disconnectGmail: () => {
    gmailDisconnect();
    set({ gmailConnected: false, gmailEmails: [], gmailError: null, gmailExpandedId: null });
  },

  fetchGmailEmails: async (deal, dealContext) => {
    if (!isGmailConnected()) return;

    const contacts = dealContext?.context?.contacts || [];
    const contactEmails = contacts
      .map((c) => c.email)
      .filter(Boolean);

    if (contactEmails.length === 0) {
      set({ gmailEmails: [], gmailLoading: false });
      return;
    }

    set({ gmailLoading: true, gmailError: null, gmailEmails: [], gmailExpandedId: null });

    try {
      const emails = await fetchEmailsForContacts(contactEmails);
      set({ gmailEmails: emails, gmailLoading: false });
    } catch (err) {
      if (err.message.includes("expired") || err.message.includes("401")) {
        set({ gmailConnected: false, gmailEmails: [], gmailLoading: false, gmailError: "Gmail session expired. Reconnect." });
      } else {
        set({ gmailEmails: [], gmailLoading: false, gmailError: err.message });
      }
    }
  },

  toggleGmailEmail: async (messageId) => {
    const { gmailExpandedId } = get();
    if (gmailExpandedId === messageId) {
      set({ gmailExpandedId: null });
      return;
    }
    set({ gmailExpandedId: messageId });
    try {
      const body = await fetchEmailBody(messageId);
      set((s) => ({
        gmailEmails: s.gmailEmails.map((e) =>
          e.id === messageId ? { ...e, body } : e
        ),
      }));
    } catch {
      // Silently fail — snippet is still shown
    }
  },

  // HubSpot (all deals)
  fetchHubspotDeals: async () => {
    set({ hubspotLoading: true, hubspotError: null });
    try {
      const res = await fetchWithRetry("/api/hubspot");
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText.substring(0, 200));
      }
      const data = await res.json();
      if (data.available === false) {
        throw new Error(data.reason || "HubSpot token not configured");
      }
      set({ hubspotDeals: data.deals || [], hubspotLoading: false, useHubspot: true });
    } catch (err) {
      set({ hubspotError: err.message, hubspotLoading: false });
    }
  },

  toggleHubspot: () => {
    const { useHubspot } = get();
    if (!useHubspot) {
      get().fetchHubspotDeals();
    } else {
      set({ useHubspot: false });
    }
  },
}));

export default useStore;
