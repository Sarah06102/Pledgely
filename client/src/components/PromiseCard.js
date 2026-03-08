import React, { useState } from "react";

const statusColors = {
  Fulfilled: "bg-emerald-100 text-emerald-800",
  "In Progress": "bg-pink-100 text-pink-800",
  Pending: "bg-amber-100 text-amber-800",
  Broken: "bg-rose-100 text-rose-800",
  Delayed: "bg-orange-100 text-orange-800",
  "Partially Completed": "bg-orange-100 text-orange-800",
};

export default function PromiseCard({ promise, onViewChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusClass = statusColors[promise.status] || "bg-slate-100 text-slate-700";
  const progress = promise.completion_percentage ?? promise.progress ?? 0;

  // ✅ support both field names
  const reasoning = promise.ai_reasoning || promise.rationale || "";
  let sources = promise.sources || promise.evidence_links || [];

  // Ensure sources is always an array to prevent mapping over string characters
  if (typeof sources === "string") {
    sources = [sources];
  }

  return (
    <article className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-medium text-[15px] leading-snug">
            {promise.promise || promise.original_quote || promise.text}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{promise.politician || promise.politicianId || "Unknown Politician"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{promise.party || "Party"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{promise.topic || "Policy"}</span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}`}>
          {promise.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* ✅ AI Reasoning */}
      {reasoning && (
        <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p className={`text-sm text-slate-600 leading-relaxed italic ${isExpanded ? "" : "line-clamp-3"}`}>
            "{reasoning}"
          </p>
          {reasoning.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Sources */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 flex-wrap">
        {sources.length > 0 ? (
          sources.map((source, i) => {
            if (!source.startsWith("http")) {
              if (source === "PDF Extraction" || source === "PDF Extraction via Script") {
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (onViewChange) onViewChange('dashboard');
                      else if (window.setView) window.setView('dashboard');
                      else window.location.href = '/?view=dashboard'; // Fallback
                    }}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center"
                  >
                    ✨ {source} →
                  </button>
                );
              }
              return (
                <span key={i} className="text-xs text-slate-500 font-medium flex items-center">
                  ✨ {source}
                </span>
              );
            }
            return (
              <a
                key={i}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink-600 hover:text-pink-700 font-medium"
              >
                Source {i + 1} →
              </a>
            );
          })
        ) : (
          <span className="text-xs text-slate-400">No sources</span>
        )}
      </div>
    </article>
  );
}