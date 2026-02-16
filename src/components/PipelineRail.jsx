import useStore from "../store/useStore";
import { STAGES, HEALTH_COLORS, MILESTONE_KEYS, getMilestoneColor } from "../data/deals";

export default function PipelineRail() {
  const mode = useStore((s) => s.mode);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const filteredDeals = useStore((s) => s.getFilteredDeals());
  const selected = useStore((s) => s.selected);
  const selectDeal = useStore((s) => s.selectDeal);
  const total = useStore((s) => s.getTotal());
  const useHubspot = useStore((s) => s.useHubspot);
  const isPipeline = mode === "pipeline";

  // Group deals by stage
  const groups = {};
  if (isPipeline) {
    STAGES.forEach((stage) => {
      const deals = filteredDeals.filter((d) => d.stage === stage);
      if (deals.length > 0) groups[stage] = deals;
    });
  } else {
    if (filteredDeals.length > 0) groups["Active Customers"] = filteredDeals;
  }

  // On mobile, hide rail when a deal is selected
  return (
    <div className={`w-full sm:w-80 shrink-0 flex flex-col h-full border-r border-slate-800 bg-slate-950 ${selected ? "hidden sm:flex" : "flex"}`}>
      {/* Rail header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isPipeline ? "Pipeline" : "Customers"}
          </span>
          <span className="text-xs text-slate-600 font-mono">
            {filteredDeals.length} &middot; ${total.toLocaleString()}
          </span>
          {!useHubspot && (
            <span className="text-[9px] text-slate-700 bg-slate-900 rounded px-1.5 py-0.5 ml-1">
              sample
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 text-xs placeholder-slate-600 outline-none focus:border-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Deal list */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groups).length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs">No deals found</div>
        ) : (
          Object.entries(groups).map(([stage, deals]) => (
            <div key={stage}>
              {/* Stage header */}
              <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {stage}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {deals.length}
                  </span>
                </div>
              </div>

              {/* Deal rows */}
              {deals.map((deal) => {
                const isSelected = selected?.id === deal.id;
                const amt = deal.amount || deal.arr || 0;
                return (
                  <div
                    key={deal.id}
                    onClick={() => selectDeal(deal)}
                    className={`px-4 py-3 cursor-pointer border-b border-slate-800/30 transition-colors ${
                      isSelected
                        ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                        : "hover:bg-slate-900/50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          HEALTH_COLORS[deal.health] || "bg-slate-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-blue-400" : "text-slate-200"
                        }`}
                      >
                        {deal.company}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 ml-4">
                      <span className="text-[11px] text-slate-500 truncate">
                        {deal.contact}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        ${amt.toLocaleString()}
                      </span>
                    </div>

                    {/* Milestone bars */}
                    {isPipeline && deal.ms && (
                      <div className="flex gap-0.5 mt-1.5 ml-4">
                        {MILESTONE_KEYS.map((k) => (
                          <div
                            key={k}
                            className="flex-1 h-1 rounded-full"
                            style={{ backgroundColor: getMilestoneColor(deal.ms[k]) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
