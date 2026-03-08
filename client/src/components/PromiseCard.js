import React from "react";

const statusColors = {
  Fulfilled: "bg-emerald-100 text-emerald-800",
  "In Progress": "bg-pink-100 text-pink-800",
  Pending: "bg-amber-100 text-amber-800",
  Broken: "bg-rose-100 text-rose-800",
  Delayed: "bg-orange-100 text-orange-800",
};

export default function PromiseCard({ promise }) {
  const statusClass = statusColors[promise.status] || "bg-slate-100 text-slate-700";
  const progress = promise.completion_percentage ?? promise.progress ?? 0;

  return (
    <article className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-medium text-[15px] leading-snug">
            {promise.promise || promise.original_quote}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-slate-500">{promise.politician || "Politician"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{promise.party || "Party"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{promise.topic || "General"}</span>
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

      {promise.rationale && (
        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {promise.rationale}
        </p>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{promise.election || "Election 2025"}</span>
        {promise.evidence_links?.length > 0 && (
          <a
            href={promise.evidence_links[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-600 hover:text-pink-700 font-medium"
          >
            Source →
          </a>
        )}
        <button className="ml-auto text-xs font-medium text-pink-600 hover:text-pink-700 group-hover:underline">
          View Clip
        </button>
      </div>
    </article>
  );
}
