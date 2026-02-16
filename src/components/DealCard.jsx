import { HEALTH_COLORS, MILESTONE_KEYS, MILESTONE_COLORS } from "../data/deals";
import useStore from "../store/useStore";

export default function DealCard({ deal }) {
  const mode = useStore((s) => s.mode);
  const selectDeal = useStore((s) => s.selectDeal);
  const isPipeline = mode === "pipeline";
  const amt = deal.amount || deal.arr || 0;

  return (
    <div
      onClick={() => selectDeal(deal)}
      className="card-hover p-4 cursor-pointer group"
    >
      {/* Top row: name + amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`health-dot ${HEALTH_COLORS[deal.health] || "bg-slate-500"}`}
          />
          <div className="min-w-0">
            <div className="font-semibold text-[15px] text-slate-100 truncate group-hover:text-blue-400 transition-colors">
              {deal.company}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {deal.contact}
            </div>
          </div>
        </div>
        <div className="text-base font-bold font-mono text-slate-200 shrink-0">
          ${amt.toLocaleString()}
        </div>
      </div>

      {/* Pipeline details */}
      {isPipeline && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Close: {deal.closeDate}</span>
            <span>{deal.lastActivity}</span>
          </div>
          {deal.ms && (
            <div className="flex gap-1 mt-2">
              {MILESTONE_KEYS.map((k) => {
                const v = deal.ms[k];
                return (
                  <div
                    key={k}
                    className={`flex-1 h-1 rounded-full ${
                      v ? MILESTONE_COLORS[v] || "bg-slate-700" : "bg-slate-800"
                    }`}
                    title={k + ": " + (v || "none")}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Expansion details */}
      {!isPipeline && (
        <div className="flex justify-between mt-3 text-xs text-slate-500">
          <span>Renewal: {deal.renewalDate}</span>
          <span>
            {deal.projects} projects &middot; {deal.usage}
          </span>
        </div>
      )}
    </div>
  );
}
