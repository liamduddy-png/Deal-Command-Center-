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

  // HubSpot state
  hubspotDeals: null, // null = not loaded, [] = loaded but empty
  hubspotLoading: false,
  hubspotError: null,
  useHubspot: false,

  // Computed
  get isPipeline() {
    return get().mode === "pipeline";
  },

  // Actions
  setMode: (mode) => set({ mode, search: "", showAttack: false, selected: null, activeAction: null, aiText: "" }),
  setSearch: (search) => set({ search }),
  toggleAttack: () => set((s) => ({ showAttack: !s.showAttack })),

  selectDeal: (deal) => set({ selected: deal, activeAction: null, aiText: "", loading: false }),
  goBack: () => set({ selected: null, activeAction: null, aiText: "", loading: false }),

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

  // AI action
  runAction: async (action) => {
    const { selected } = get();
    if (!selected) return;

    set({ activeAction: action.id, loading: true, aiText: "" });
    const prompt = getPrompt(action.id, selected);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
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

  // HubSpot
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
