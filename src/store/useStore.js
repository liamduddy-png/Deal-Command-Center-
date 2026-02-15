import { create } from "zustand";
import { PIPELINE_DEALS, EXPANSION_DEALS } from "../data/deals";
import { PIPELINE_ACTIONS, EXPANSION_ACTIONS } from "../data/actions";

// Extract deal ID from HubSpot URL
// e.g. https://app.hubspot.com/contacts/12345678/deal/98765432
function extractDealId(url) {
  const match = url.match(/deal\/(\d+)/);
  return match ? match[1] : null;
}

const useStore = create((set, get) => ({
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

  // Actions
  setMode: (mode) => set({ mode, search: "", showAttack: false, selected: null, activeAction: null, aiText: "", dealContext: null }),
  setSearch: (search) => set({ search }),
  toggleAttack: () => set((s) => ({ showAttack: !s.showAttack })),

  selectDeal: (deal) => {
    set({ selected: deal, activeAction: null, aiText: "", loading: false, dealContext: null, dealContextLoading: true });
    get().fetchDealContext(deal.company);
  },
  goBack: () => set({ selected: null, activeAction: null, aiText: "", loading: false, dealContext: null }),

  // Load deal from pasted HubSpot URL
  loadDealFromUrl: async (url) => {
    const dealId = extractDealId(url);
    if (!dealId) {
      set({ aiText: "Could not extract deal ID from URL. Expected format: https://app.hubspot.com/.../deal/123456" });
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
    } catch {
      set({ dealContextLoading: false });
    }
  },

  // AI action — sends { type, context } to /api/generate
  // Claude automatically receives ALL deal context from HubSpot
  runAction: async (action) => {
    const { selected, dealContext, mode } = get();
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
      meddpicc: hubspot?.meddpicc || null,
      gong: hubspot?.gong || null,
      contacts: hubspot?.contacts || [],
      recentActivity: hubspot?.engagements || [],
      engagementRecency: hubspot?.engagements?.length > 0
        ? hubspot.engagements[0].date
        : null,
      dealDescription: hubspot?.deal?.description || null,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: action.id, context }),
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
