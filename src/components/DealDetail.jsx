import useStore from "../store/useStore";
import {
  HEALTH_COLORS,
  HEALTH_TEXT_COLORS,
  MILESTONE_KEYS,
  MILESTONE_COLORS,
} from "../data/deals";
import SmartActions from "./SmartActions";
import AIResponse from "./AIResponse";

const MILESTONE_LABELS = {
  change: "Change",
  technical: "Technical",
  pricing: "Pricing",
  commercial: "Commercial",
  security: "Security",
};

export default function DealDetail() {
  const deal = useStore((s) => s.selected);
  const mode = useStore((s) => s.mode);
  const goBack = useStore((s) => s.goBack);
  const isPipeline = mode === "pipeline";

  if (!deal) return null;

  const amt = deal.amount || deal.arr || 0;

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to {isPipeline ? "Pipeline" : "Customers"}
      </button>

      {/* Deal header card */}
      <div className="card p-7 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          {/* Left: company info */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  HEALTH_COLORS[deal.health] || "bg-slate-500"
                }`}
              />
              <h2 className="text-2xl font-bold text-slate-50">
                {deal.company}
              </h2>
            </div>
            <p className="text-slate-400 text-sm mt-1 ml-6">{deal.contact}</p>
          </div>

          {/* Right: amount + badge */}
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-50">
              ${amt.toLocaleString()}
            </div>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isPipeline
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {isPipeline ? deal.stage : "Renews: " + deal.renewalDate}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex gap-8 mt-6 pt-5 border-t border-slate-800 flex-wrap">
          {isPipeline ? (
            <>
              <Stat label="Close Date" value={deal.closeDate} />
              <Stat label="Last Activity" value={deal.lastActivity} />
              <Stat
                label="Health"
                value={deal.health}
                className={`capitalize font-semibold ${
                  HEALTH_TEXT_COLORS[deal.health] || "text-slate-400"
                }`}
              />
              {deal.ms && (
                <div className="flex-1 min-w-[180px]">
                  <div className="label mb-2">Milestones</div>
                  <div className="flex gap-1.5">
                    {MILESTONE_KEYS.map((k) => {
                      const v = deal.ms[k];
                      return (
                        <div key={k} className="flex-1 group/ms">
                          <div
                            className={`h-1.5 rounded-full ${
                              v
                                ? MILESTONE_COLORS[v] || "bg-slate-700"
                                : "bg-slate-800"
                            }`}
                          />
                          <div className="text-[9px] text-slate-600 mt-1 text-center">
                            {MILESTONE_LABELS[k]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Stat label="Usage" value={deal.usage} />
              <Stat label="Projects" value={deal.projects} />
              <Stat
                label="Risk"
                value={deal.risk}
                className={
                  deal.risk === "None" || deal.risk === "None identified"
                    ? "text-green-400"
                    : "text-amber-400"
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Smart Actions */}
      <SmartActions />

      {/* AI Response */}
      <AIResponse />
    </div>
  );
}

function Stat({ label, value, className = "" }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className={`mt-1 text-sm ${className || "text-slate-200"}`}>
        {value}
      </div>
    </div>
  );
}
