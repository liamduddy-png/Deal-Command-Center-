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
// e.g. https://app.hubspot.com/contacts/12345678/deal/98765432
//      https://app.hubspot.com/contacts/12345678/record/0-3/98765432
function extractDealId(url) {
  const dealMatch = url.match(/deal\/(\d+)/);
  if (dealMatch) return dealMatch[1];
  const recordMatch = url.match(/record\/0-3\/(\d+)/);
  if (recordMatch) return recordMatch[1];
  // Fall back to last numeric segment in the URL path
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

  // AI state
  activeAction: null,
  aiText: "",
  loading: false,

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
  gmailExpandedId: null, // ID of email with expanded body

  // Actions
  setMode: (mode) => set({ mode, search: "", showAttack: false, selected: null, activeAction: null, aiText: "", dealContext: null }),
  setSearch: (search) => set({ search }),
  toggleAttack: () => set((s) => ({ showAttack: !s.showAttack })),

  selectDeal: (deal) => {
    set({ selected: deal, activeAction: null, aiText: "", loading: false, dealContext: null, dealContextLoading: true, gmailEmails: [], gmailExpandedId: null });
    get().fetchDealContext(deal.company);
  },
  goBack: () => set({ selected: null, activeAction: null, aiText: "", loading: false, dealContext: null, gmailEmails: [], gmailExpandedId: null }),

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
      const res = await fetch(`/api/deal?id=${dealId}`);
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
      // Create a synthetic deal object from HubSpot data
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
      // Auto-fetch Gmail emails
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

  // Fetch HubSpot context for a single deal (by company name)
  fetchDealContext: async (companyName) => {
    try {
      const res = await fetch(`/api/deal?company=${encodeURIComponent(companyName)}`);
      if (!res.ok) {
        set({ dealContextLoading: false });
        return;
      }
      const data = await res.json();
      set({ dealContext: data, dealContextLoading: false });
      // Auto-fetch Gmail emails once we have contact info
      const { selected } = get();
      if (selected && isGmailConnected()) {
        get().fetchGmailEmails(selected, data);
      }
    } catch {
      set({ dealContextLoading: false });
    }
  },

  // AI action — sends { type, context } to /api/generate
  // Claude automatically receives ALL deal context from HubSpot + Gmail
  runAction: async (action) => {
    const { selected, dealContext, mode, gmailEmails } = get();
    if (!selected) return;

    set({ activeAction: action.id, loading: true, aiText: "" });

    // Build context: merge local deal data with HubSpot intel
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
      // Expansion fields
      arr: selected.arr || null,
      renewalDate: selected.renewalDate || null,
      usage: selected.usage || null,
      risk: selected.risk || null,
      projects: selected.projects || null,
      // HubSpot intel (auto-injected, no pasting)
      // MEDDPICC fields — for analysis, not just display
      meddpicc: hubspot?.meddpicc || null,
      // Gong call summaries
      gong: hubspot?.gong || null,
      // Contact intelligence: names, titles, influence, active status
      contacts: hubspot?.contacts || [],
      contactSummary: hubspot?.contactSummary || null,
      // Activity intelligence: last 10 engagements with sender/recipient
      recentActivity: hubspot?.engagements || [],
      activitySummary: hubspot?.activitySummary || null,
      // Historical signals: days in pipeline, stale detection, gaps
      history: hubspot?.history || null,
      // Milestone properties from HubSpot custom fields
      hubspotMilestones: hubspot?.milestones || null,
      // Deal-level fields
      nextStep: hubspot?.deal?.nextStep || null,
      dealRisk: hubspot?.deal?.risk || null,
      compellingEvent: hubspot?.deal?.compellingEvent || null,
      dealDescription: hubspot?.deal?.description || null,
      // Gmail email history with deal contacts
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
      // Route deep_research to Perplexity-powered endpoint
      const isDeepResearch = action.id === "deep_research";
      const endpoint = isDeepResearch ? "/api/deep-research" : "/api/generate";
      const body = isDeepResearch
        ? { company: selected.company, context }
        : { type: action.id, context };

      const res = await fetch(endpoint, {
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
        set({ aiText: data.output, loading: false });
      } else if (data?.error) {
        set({ aiText: "API Error: " + (data.error.message || JSON.stringify(data.error)), loading: false });
      } else {
        set({ aiText: "Unexpected response format", loading: false });
      }
    } catch (err) {
      set({ aiText: "Error: " + err.message, loading: false });
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
        // Auto-fetch emails if a deal is selected
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

    // Collect contact emails from deal context
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
    // Fetch body and expand
    set({ gmailExpandedId: messageId });
    try {
      const body = await fetchEmailBody(messageId);
      // Update the email in the list with its body
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
      const res = await fetch("/api/hubspot");
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText.substring(0, 200));
      }
      const data = await res.json();
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
