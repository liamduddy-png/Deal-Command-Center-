import useStore from "../store/useStore";
import { STAGES } from "../data/deals";
import DealCard from "./DealCard";

export default function DealGrid() {
  const mode = useStore((s) => s.mode);
  const filteredDeals = useStore((s) => s.getFilteredDeals());
  const isPipeline = mode === "pipeline";

  // Group deals
  const groups = {};
  if (isPipeline) {
    STAGES.forEach((stage) => {
      const deals = filteredDeals.filter((d) => d.stage === stage);
      if (deals.length > 0) groups[stage] = deals;
    });
  } else {
    if (filteredDeals.length > 0) {
      groups["Active Customers"] = filteredDeals;
    }
  }

  if (Object.keys(groups).length === 0) {
    return (
      <div className="text-center py-16 text-slate-600">
        <div className="text-4xl mb-3 opacity-50">&#x1F50D;</div>
        <div className="text-sm">No deals found</div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {Object.entries(groups).map(([stage, deals]) => {
        const stageTotal = deals.reduce(
          (s, d) => s + (d.amount || d.arr || 0),
          0
        );
        return (
          <div key={stage}>
            {/* Stage header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stage}
              </span>
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs text-slate-600">
                {deals.length} &middot; ${stageTotal.toLocaleString()}
              </span>
            </div>

            {/* Deal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
