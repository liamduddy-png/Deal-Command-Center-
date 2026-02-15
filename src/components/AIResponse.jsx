import { useState } from "react";
import ReactMarkdown from "react-markdown";
import useStore from "../store/useStore";

export default function AIResponse() {
  const loading = useStore((s) => s.loading);
  const aiText = useStore((s) => s.aiText);
  const activeAction = useStore((s) => s.activeAction);
  const actions = useStore((s) => s.getActions());
  const [copied, setCopied] = useState(false);

  if (!loading && !aiText) return null;

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
        <div className="label">
          {loading ? "Generating..." : actionLabel}
        </div>
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
