import { useState } from "react";
import ReactMarkdown from "react-markdown";
import useStore from "../store/useStore";

export default function OutputPanel() {
  const loading = useStore((s) => s.loading);
  const aiText = useStore((s) => s.aiText);
  const activeAction = useStore((s) => s.activeAction);
  const actions = useStore((s) => s.getActions());
  const selected = useStore((s) => s.selected);
  const aiHistory = useStore((s) => s.aiHistory);
  const showHistory = useStore((s) => s.showHistory);
  const toggleHistory = useStore((s) => s.toggleHistory);
  const loadFromHistory = useStore((s) => s.loadFromHistory);
  const clearDealHistory = useStore((s) => s.clearDealHistory);
  const [copied, setCopied] = useState(false);

  const dealHistory = selected ? (aiHistory[selected.company] || []) : [];
  const hasHistory = dealHistory.length > 0;

  // Show history panel
  if (showHistory && hasHistory) {
    return (
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="label text-purple-400">AI Output History</span>
            <span className="text-[10px] text-slate-600">{dealHistory.length} saved</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearDealHistory(selected.company)}
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={toggleHistory}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dealHistory.map((entry, i) => {
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              + " " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            return (
              <button
                key={i}
                onClick={() => { loadFromHistory(entry); toggleHistory(); }}
                className="w-full text-left px-4 py-3 rounded-lg transition-all hover:bg-slate-800/50 border border-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">{entry.actionLabel}</span>
                  <span className="text-[10px] text-slate-600">{timeStr}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {entry.output.substring(0, 120)}...
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!loading && !aiText) {
    // Show history button even when no current output
    if (hasHistory) {
      return (
        <button
          onClick={toggleHistory}
          className="w-full text-left card px-5 py-3 flex items-center gap-2 hover:border-purple-500/30 transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-xs text-purple-400">View {dealHistory.length} saved AI output{dealHistory.length > 1 ? "s" : ""}</span>
        </button>
      );
    }
    return null;
  }

  const actionLabel =
    actions.find((a) => a.id === activeAction)?.label || "";

  function handleCopy() {
    navigator.clipboard.writeText(aiText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="label">
            {loading ? "Generating..." : actionLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {hasHistory && !loading && (
            <button
              onClick={toggleHistory}
              className="text-[10px] text-purple-400/70 hover:text-purple-400 transition-colors"
            >
              History ({dealHistory.length})
            </button>
          )}
          {!loading && aiText && (
            <button
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Working on it...
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-slate-800 rounded animate-pulse w-5/6" />
          </div>
        </div>
      ) : (
        <div className="ai-prose text-slate-300 text-sm leading-relaxed">
          <ReactMarkdown>{aiText}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
