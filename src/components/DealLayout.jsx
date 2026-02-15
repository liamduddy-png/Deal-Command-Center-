import { useState } from "react";
import useStore from "../store/useStore";
import {
  HEALTH_COLORS,
  HEALTH_TEXT_COLORS,
  MILESTONE_KEYS,
  getEngagementStatus,
  getMilestoneColor,
} from "../data/deals";
import OutputPanel from "./OutputPanel";

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

export default function DealLayout() {
  const deal = useStore((s) => s.selected);
  const mode = useStore((s) => s.mode);
  const dealContext = useStore((s) => s.dealContext);
  const dealContextLoading = useStore((s) => s.dealContextLoading);
  const actions = useStore((s) => s.getActions());
  const activeAction = useStore((s) => s.activeAction);
  const runAction = useStore((s) => s.runAction);
  const loading = useStore((s) => s.loading);
  const loadDealFromUrl = useStore((s) => s.loadDealFromUrl);
  const aiText = useStore((s) => s.aiText);
  const [urlInput, setUrlInput] = useState("");
  const isPipeline = mode === "pipeline";

  // No deal selected — show URL input or loading state
  if (!deal) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-200 mb-2">
            Deal Command Center
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Select a deal from the pipeline, or paste a HubSpot deal URL
          </p>

          {dealContextLoading ? (
            <div className="py-8">
              <div className="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400">Loading deal from HubSpot...</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://app.hubspot.com/.../deal/123456"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (aiText) useStore.setState({ aiText: "" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput.trim()) {
                      loadDealFromUrl(urlInput.trim());
                      setUrlInput("");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-50 text-sm placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button
                  onClick={() => {
                    if (urlInput.trim()) {
                      loadDealFromUrl(urlInput.trim());
                      setUrlInput("");
                    }
                  }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Load
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                Deal ID will be extracted automatically
              </p>
            </>
          )}

          {/* Show error messages when deal load fails */}
          {!dealContextLoading && aiText && !deal && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{aiText}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const amt = deal.amount || deal.arr || 0;
  const hubspot = dealContext?.context || null;
  const hasHubspot = dealContext?.found;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Deal header */}
        <div className="card p-6 mb-5">
          <div className="flex justify-between items-start flex-wrap gap-4">
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
                {dealContextLoading && (
                  <span className="text-[10px] text-slate-600 border border-slate-800 rounded px-1.5 py-0.5 animate-pulse">
                    syncing...
                  </span>
                )}
                {hasHubspot && (
                  <span className="text-[10px] text-orange-400 border border-orange-500/30 bg-orange-500/10 rounded px-1.5 py-0.5">
                    HubSpot
                  </span>
                )}
                {hasHubspot && hubspot?.engagements && (() => {
                  const status = getEngagementStatus(hubspot.engagements);
                  return (
                    <span className={`text-[10px] border rounded px-1.5 py-0.5 font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-slate-400 text-sm mt-1 ml-6">{deal.contact}</p>
              {/* HubSpot contacts */}
              {hubspot?.contacts?.length > 0 && (
                <div className="ml-6 mt-1 flex flex-wrap gap-2">
                  {hubspot.contacts.map((c, i) => (
                    <span key={i} className="text-[10px] text-slate-500">
                      {c.name}{c.title ? ` (${c.title})` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
          <div className="flex gap-8 mt-5 pt-4 border-t border-slate-800 flex-wrap">
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
                          <div key={k} className="flex-1">
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
        {hasHubspot && <HubSpotPanel context={hubspot} />}

        {/* Gmail Emails Panel */}
        <GmailPanel />

        {/* Smart Actions */}
        <div className="mb-5">
          <div className="label mb-3">Smart Actions</div>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => {
              const isActive = activeAction === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => runAction(a)}
                  disabled={loading}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50"
                  } ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                  title={a.desc}
                >
                  <span className="mr-1.5">{a.icon}</span>
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Output */}
        <OutputPanel />
      </div>
    </div>
  );
}

const ACTIVITY_TYPE_CONFIG = {
  EMAIL: { icon: "\u2709\uFE0F", label: "Email", color: "#4285F4", bg: "rgba(66,133,244,0.1)" },
  INCOMING_EMAIL: { icon: "\u2709\uFE0F", label: "Email", color: "#4285F4", bg: "rgba(66,133,244,0.1)" },
  CALL: { icon: "\uD83D\uDCDE", label: "Call", color: "#34A853", bg: "rgba(52,168,83,0.1)" },
  MEETING: { icon: "\uD83D\uDCC5", label: "Meeting", color: "#FBBC04", bg: "rgba(251,188,4,0.1)" },
  NOTE: { icon: "\uD83D\uDCDD", label: "Note", color: "#9AA0A6", bg: "rgba(154,160,166,0.1)" },
  TASK: { icon: "\u2611\uFE0F", label: "Task", color: "#EA4335", bg: "rgba(234,67,53,0.1)" },
  GMAIL: { icon: "\u2709\uFE0F", label: "Gmail", color: "#4285F4", bg: "rgba(66,133,244,0.15)" },
};

function getActivityConfig(type) {
  return ACTIVITY_TYPE_CONFIG[(type || "").toUpperCase()] || ACTIVITY_TYPE_CONFIG.NOTE;
}

function HubSpotPanel({ context }) {
  const { meddpicc, gong, engagements, contacts, history, activitySummary } = context;
  const gmailEmails = useStore((s) => s.gmailEmails);
  const gmailConnected = useStore((s) => s.gmailConnected);
  const deal = useStore((s) => s.selected);
  const hasContent = meddpicc || gong?.summary || engagements?.length > 0;

  if (!hasContent) return null;

  // Build unified timeline: HubSpot engagements + Gmail emails
  const timelineItems = [];

  // Add HubSpot engagements
  if (engagements?.length > 0) {
    for (const eng of engagements) {
      timelineItems.push({
        source: "hubspot",
        type: (eng.type || "NOTE").toUpperCase(),
        timestamp: eng.date ? new Date(eng.date).getTime() : 0,
        date: eng.date || "",
        subject: eng.subject || eng.preview || "Activity",
        from: eng.from || "",
        to: eng.to || "",
        preview: eng.preview || "",
        durationMin: eng.durationMin || null,
      });
    }
  }

  // Merge Gmail emails (deduplicate by matching date + subject)
  if (gmailConnected && gmailEmails.length > 0) {
    for (const email of gmailEmails) {
      const emailDate = new Date(email.timestamp).toISOString().split("T")[0];
      const isDuplicate = timelineItems.some(
        (t) => t.source === "hubspot" && t.type === "EMAIL" && t.date === emailDate &&
          t.subject && email.subject && t.subject.toLowerCase().includes(email.subject.toLowerCase().substring(0, 20))
      );
      if (!isDuplicate) {
        timelineItems.push({
          source: "gmail",
          type: "GMAIL",
          timestamp: email.timestamp,
          date: emailDate,
          subject: email.subject,
          from: email.from,
          to: email.to,
          preview: email.snippet || "",
          isSent: email.isSent,
        });
      }
    }
  }

  // Sort newest first
  timelineItems.sort((a, b) => b.timestamp - a.timestamp);

  // Compute activity stats
  const typeCounts = {};
  for (const item of timelineItems) {
    const key = item.type === "GMAIL" ? "EMAIL" : item.type;
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  }

  // Detect activity gaps (7+ days)
  const gaps = [];
  for (let i = 0; i < timelineItems.length - 1; i++) {
    const gapDays = Math.floor((timelineItems[i].timestamp - timelineItems[i + 1].timestamp) / 86400000);
    if (gapDays >= 7) {
      gaps.push({ afterDate: timelineItems[i + 1].date, beforeDate: timelineItems[i].date, days: gapDays });
    }
  }

  // Deal lifecycle markers
  const createdDate = history?.createdDate || null;
  const closeDate = deal?.closeDate || null;
  const daysInPipeline = history?.daysInPipeline || null;

  return (
    <div className="card p-5 mb-5 border-orange-500/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-orange-400 text-sm">&#x1F50C;</span>
        <span className="label text-orange-400">HubSpot Deal Intelligence</span>
        <span className="text-[10px] text-slate-600 ml-auto">Read-only</span>
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
        {gong?.summary && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Gong Call Intel
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {gong.summary}
            </p>
            {gong.link && (
              <a
                href={gong.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
              >
                Open in Gong &#x2197;
              </a>
            )}
          </div>
        )}

        {/* Activity Timeline */}
        {timelineItems.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 lg:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Activity Timeline
              </div>
              {/* Activity type badges */}
              <div className="flex gap-1.5 ml-auto">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const cfg = getActivityConfig(type);
                  return (
                    <span
                      key={type}
                      className="text-[9px] font-medium rounded px-1.5 py-0.5"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label} {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Deal lifecycle bar */}
            {(createdDate || closeDate) && (
              <div className="flex items-center gap-2 mb-3 px-1">
                {createdDate && (
                  <span className="text-[9px] text-slate-600">
                    Created {createdDate}
                  </span>
                )}
                {daysInPipeline != null && (
                  <span className="text-[9px] text-slate-600">
                    &middot; {daysInPipeline}d in pipeline
                  </span>
                )}
                {closeDate && (
                  <span className="text-[9px] text-slate-600 ml-auto">
                    Close {closeDate}
                  </span>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <div className="space-y-1.5">
                {timelineItems.map((item, i) => {
                  const cfg = getActivityConfig(item.type);
                  const fromName = (item.from || "").replace(/<[^>]+>/, "").trim();
                  const toName = (item.to || "").replace(/<[^>]+>/, "").trim();

                  // Check if there's a gap before this item
                  const gapBefore = i > 0 ? gaps.find((g) => g.afterDate === item.date) : null;

                  return (
                    <div key={`${item.source}-${i}`}>
                      {/* Gap indicator */}
                      {gapBefore && (
                        <div className="flex items-center gap-2 py-1 px-2 rounded"
                          style={{ background: "rgba(245,158,11,0.06)", borderLeft: "3px solid rgba(245,158,11,0.3)" }}
                        >
                          <span className="text-[9px] text-amber-500/80 font-medium">
                            {gapBefore.days}-day gap in activity
                          </span>
                        </div>
                      )}

                      <div
                        className="flex items-start gap-2 py-2 pl-1 pr-2 rounded-lg transition-colors"
                        style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}
                      >
                        {/* Type badge */}
                        <span
                          className="text-[9px] font-bold shrink-0 w-14 text-center rounded py-0.5 mt-0.5"
                          style={{ background: cfg.color + "22", color: cfg.color }}
                        >
                          {cfg.label.toUpperCase()}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-medium truncate"
                              style={{ color: cfg.color }}
                            >
                              {item.subject || "Activity"}
                            </span>
                            {item.durationMin && (
                              <span className="text-[9px] text-slate-500 shrink-0">
                                {item.durationMin}min
                              </span>
                            )}
                          </div>
                          {(fromName || toName) && (
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {fromName && toName
                                ? `${fromName} \u2192 ${toName}`
                                : fromName || toName}
                            </div>
                          )}
                          {item.preview && item.type !== "EMAIL" && item.type !== "GMAIL" && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {item.preview.substring(0, 120)}
                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <span className="text-[10px] text-slate-500 shrink-0 mt-0.5 font-medium">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GmailPanel() {
  const gmailConnected = useStore((s) => s.gmailConnected);
  const gmailEmails = useStore((s) => s.gmailEmails);
  const gmailLoading = useStore((s) => s.gmailLoading);
  const gmailError = useStore((s) => s.gmailError);
  const gmailExpandedId = useStore((s) => s.gmailExpandedId);
  const toggleGmailEmail = useStore((s) => s.toggleGmailEmail);

  if (!gmailConnected) return null;

  if (gmailLoading) {
    return (
      <div className="card p-5 mb-5" style={{ borderColor: "rgba(66,133,244,0.2)" }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">&#x2709;</span>
          <span className="label" style={{ color: "#4285F4" }}>Gmail</span>
          <span className="text-[10px] text-slate-600 ml-auto animate-pulse">loading emails...</span>
        </div>
      </div>
    );
  }

  if (gmailError) {
    return (
      <div className="card p-5 mb-5" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">&#x2709;</span>
          <span className="label" style={{ color: "#EF4444" }}>Gmail Error</span>
        </div>
        <p className="text-xs text-red-400">{gmailError}</p>
      </div>
    );
  }

  if (gmailEmails.length === 0) return null;

  return (
    <div className="card p-5 mb-5" style={{ borderColor: "rgba(66,133,244,0.2)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">&#x2709;</span>
        <span className="label" style={{ color: "#4285F4" }}>Gmail — Email History with Contacts</span>
        <span className="text-[10px] text-slate-600 ml-auto">{gmailEmails.length} emails</span>
      </div>

      <div className="space-y-1">
        {gmailEmails.map((email) => {
          const isExpanded = gmailExpandedId === email.id;
          const dateStr = new Date(email.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          // Parse sender name from "Name <email>" format
          const fromName = email.from.replace(/<[^>]+>/, "").trim() || email.from;

          return (
            <div key={email.id}>
              <button
                onClick={() => toggleGmailEmail(email.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all hover:bg-slate-800/50 flex items-start gap-3"
                style={{ background: isExpanded ? "rgba(66,133,244,0.05)" : "transparent" }}
              >
                {/* Direction indicator */}
                <span
                  className="text-[9px] font-bold mt-1 shrink-0 w-10 text-center rounded py-0.5"
                  style={{
                    background: email.isSent ? "rgba(66,133,244,0.1)" : "rgba(52,168,83,0.1)",
                    color: email.isSent ? "#4285F4" : "#34A853",
                  }}
                >
                  {email.isSent ? "SENT" : "RECV"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium truncate">
                      {email.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 truncate">
                      {email.isSent ? `To: ${email.to}` : `From: ${fromName}`}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">
                  {dateStr}
                </span>
              </button>

              {/* Expanded email body */}
              {isExpanded && (
                <div className="mx-3 mb-2 px-4 py-3 rounded-lg text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto"
                  style={{ background: "#0E0E0E", borderLeft: "2px solid #4285F4" }}
                >
                  {email.body || email.snippet || "No content available"}
                </div>
              )}
            </div>
          );
        })}
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
