import useStore from "../store/useStore";

export default function SearchBar() {
  const mode = useStore((s) => s.mode);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const showAttack = useStore((s) => s.showAttack);
  const toggleAttack = useStore((s) => s.toggleAttack);
  const filteredDeals = useStore((s) => s.getFilteredDeals());
  const total = useStore((s) => s.getTotal());
  const isPipeline = mode === "pipeline";

  return (
    <div className="flex gap-3 mb-6 flex-wrap items-center">
      {/* Search input */}
      <div className="flex-1 min-w-[200px] relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
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
          placeholder={isPipeline ? "Search deals..." : "Search customers..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-50 text-sm placeholder-slate-600 outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
        />
      </div>

      {/* Stats */}
      <div className="card flex items-center gap-5 px-5 py-3">
        <div>
          <div className="label">Deals</div>
          <div className="text-lg font-bold font-mono text-slate-50">
            {filteredDeals.length}
          </div>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <div className="label">{isPipeline ? "Pipeline" : "ARR"}</div>
          <div className="text-lg font-bold font-mono text-slate-50">
            ${total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Attack Plan toggle */}
      {isPipeline && (
        <button
          onClick={toggleAttack}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            showAttack
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          &#x26A1; Attack Plan
        </button>
      )}
    </div>
  );
}
