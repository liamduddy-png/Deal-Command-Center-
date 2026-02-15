import { create } from "zustand";
import { PIPELINE_DEALS, EXPANSION_DEALS } from "../data/deals";
import { PIPELINE_ACTIONS, EXPANSION_ACTIONS } from "../data/actions";
import { getPrompt } from "../data/prompts";

const useStore = create((set, get) => ({
  // View state
  mode: "pipeline", // "pipeline" | "expansion"
  search: "",
  selected: null,
  showAttack: false,

  // AI state
  activeAction: null,
  aiText: "",
  loading: false,

  // HubSpot deal context (fetched per-deal)
  dealContext: null, // { available, found, meddpicc, gong, recentActivity, notes, contextBlock }
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
    // Fetch HubSpot context for this deal
    get().fetchDealContext(deal.company);
  },
  goBack: () => set({ selected: null, activeAction: null, aiText: "", loading: false, dealContext: null }),

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

  // Fetch HubSpot context for a single deal
  fetchDealContext: async (companyName) => {
    try {
      const res = await fetch(`/api/hubspot-deal?company=${encodeURIComponent(companyName)}`);
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

  // AI action — includes HubSpot context in prompt
  runAction: async (action) => {
    const { selected, dealContext } = get();
    if (!selected) return;

    set({ activeAction: action.id, loading: true, aiText: "" });

    // Build the prompt with deal data
    let prompt = getPrompt(action.id, selected);

    // Inject HubSpot context if available
    if (dealContext?.found && dealContext?.contextBlock) {
      prompt = `${prompt}\n\n---\n\nHere is real deal intelligence from HubSpot CRM. Use this data to make your response specific and actionable:\n\n${dealContext.contextBlock}`;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error("HTTP " + res.status + ": " + errText.substring(0, 200));
      }

      const data = await res.json();

      if (data?.content) {
        const text = data.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("");
        set({ aiText: text || "Empty response", loading: false });
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
