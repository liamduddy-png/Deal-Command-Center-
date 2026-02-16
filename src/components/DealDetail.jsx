import useStore from "../store/useStore";
import {
  HEALTH_COLORS,
  HEALTH_TEXT_COLORS,
  MILESTONE_KEYS,
  MILESTONE_COLORS,
  getEngagementStatus,
  getMilestoneColor,
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

const MEDDPICC_LABELS = {
  metrics: "Metrics",
  economic_buyer: "Economic Buyer",
  decision_criteria: "Decision Criteria",
  decision_process: "Decision Process",
  identify_pain: "Identify Pain",
  champion: "Champion",
  competition: "Competition",
  paper_process: "Paper Process",
};

export default function DealDetail() {
  const deal = useStore((s) => s.selected);
  const mode = useStore((s) => s.mode);
  const goBack = useStore((s) => s.goBack);
  const dealContext = useStore((s) => s.dealContext);
  const dealContextLoading = useStore((s) => s.dealContextLoading);
  const isPipeline = mode === "pipeline";

  if (!deal) return null;

  const amt = deal.amount || deal.arr || 0;
  const hasHubspot = dealContext?.found;

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
              {/* HubSpot badge */}
              {dealContextLoading && (
                <span className="text-[10px] text-slate-600 border border-slate-800 rounded px-1.5 py-0.5 animate-pulse">
                  syncing HubSpot...
                </span>
              )}
              {hasHubspot && (
                <span className="text-[10px] text-orange-400 border border-orange-500/30 bg-orange-500/10 rounded px-1.5 py-0.5">
                  HubSpot
                </span>
              )}
              {hasHubspot && dealContext.recentActivity && (() => {
                const status = getEngagementStatus(dealContext.recentActivity);
                return (
                  <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${status.className}`}>
                    {status.label}
                  </span>
                );
              })()}
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
                      const color = getMilestoneColor(v);
                      return (
                        <div key={k} className="flex-1 group/ms">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="text-[9px] text-slate-600 mt-1 text-center">
                            {MILESTONE_LABELS[k]}
                          </div>
                          {v && (
                            <div
                              className="text-[8px] mt-0.5 text-center capitalize"
                              style={{ color }}
                            >
                              {v.replace(/_/g, " ")}
                            </div>
                          )}
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

      {/* HubSpot Intel Panel */}
      {hasHubspot && <HubSpotPanel context={dealContext} />}

      {/* Smart Actions */}
      <SmartActions />

      {/* AI Response */}
      <AIResponse />
    </div>
  );
}

function HubSpotPanel({ context }) {
  const { meddpicc, gong, recentActivity, notes } = context;
  const hasContent = meddpicc || gong?.summary || gong?.notes?.length > 0 || recentActivity?.length > 0 || notes?.length > 0;

  if (!hasContent) return null;

  const engStatus = getEngagementStatus(recentActivity);

  return (
    <div className="card p-5 mb-6 animate-slide-up border-orange-500/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-400 text-sm">&#x1F50C;</span>
        <span className="label text-orange-400">HubSpot Deal Intelligence</span>
        <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${engStatus.className}`}>
          {engStatus.label}
        </span>
        <span className="text-[10px] text-slate-600 ml-auto">Read-only &middot; auto-synced</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MEDDPICC */}
        {meddpicc && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              MEDDPICC
            </div>
            <div className="space-y-2">
              {Object.entries(MEDDPICC_LABELS).map(([key, label]) => {
                const val = meddpicc[key];
                return (
                  <div key={key} className="flex items-start gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        val ? "bg-green-500" : "bg-slate-700"
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="text-xs text-slate-500">{label}: </span>
                      <span className="text-xs text-slate-300">
                        {val || "Not captured"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gong */}
        {(gong?.summary || gong?.notes?.length > 0) && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Gong Call Intel
            </div>
            {gong.summary && (
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {gong.summary}
              </p>
            )}
            {gong.notes?.map((note, i) => (
              <div
                key={i}
                className="text-xs text-slate-400 border-l-2 border-purple-500/30 pl-3 mb-2"
              >
                {note.preview || note.body?.substring(0, 200)}
              </div>
            ))}
            {gong.link && (
              <a
                href={gong.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block"
              >
                Open in Gong &#x2197;
              </a>
            )}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity?.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Recent Activity
            </div>
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map((act, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] text-slate-600 w-16 shrink-0 mt-0.5">
                    {act.date || ""}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase w-12 shrink-0 mt-0.5">
                    {act.type || ""}
                  </span>
                  <span className="text-xs text-slate-300 truncate">
                    {act.subject || act.preview || "Activity"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes?.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Notes
            </div>
            <div className="space-y-2">
              {notes.slice(0, 3).map((note, i) => (
                <div key={i} className="text-xs text-slate-400 border-l-2 border-slate-700 pl-3">
                  <span className="text-slate-600">{note.date || ""}</span>{" "}
                  {note.preview || ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
