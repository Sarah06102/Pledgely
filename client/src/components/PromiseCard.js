import React, { useState } from "react";

const statusColors = {
  Fulfilled: "bg-emerald-100 text-emerald-800",
  "In Progress": "bg-pink-100 text-pink-800",
  Pending: "bg-amber-100 text-amber-800",
  Broken: "bg-rose-100 text-rose-800",
  Delayed: "bg-orange-100 text-orange-800",
  "Partially Completed": "bg-orange-100 text-orange-800",
};

function capitalizeWords(str) {
  if (!str || typeof str !== "string") return str;
  return str.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

const POLITICIAN_DISPLAY_NAMES = {
  carney: "Mark Carney",
  poilievre: "Pierre Poilievre",
  singh: "Jagmeet Singh",
  may: "Elizabeth May",
  blanchet: "Yves-Francois Blanchet",
};

const POLITICIAN_PARTIES = {
  "Mark Carney": "Liberal Party",
  "Pierre Poilievre": "Conservative Party",
  "Jagmeet Singh": "New Democratic Party",
  "Elizabeth May": "Green Party",
  "Yves-Francois Blanchet": "Bloc Québécois",
};

const HARDCODED_LINKS = {
  "federal pipelines pushing through quebec": "https://nationalpost.com/news/politics/bloc-quebecois-election-platform",
  "emissions by 2050": "https://www.cbc.ca/news/politics/ndp-jagmeet-singh-net-zero-electric-grid-1.6936274",
  "50% of all new cars": "https://liberal.ca/our-platform/zero-emissions-vehicles/",
};

export default function PromiseCard({ promise, onViewChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const statusClass = statusColors[promise.status] || "bg-slate-100 text-slate-700";
  const progress = promise.completion_percentage ?? promise.progress ?? 0;

  // ✅ support both field names
  const reasoning = promise.ai_reasoning || promise.rationale || "";
  let sources = promise.sources || promise.evidence_links || [];

  // Ensure sources is always an array to prevent mapping over string characters
  if (typeof sources === "string") {
    sources = [sources];
  }

const rawPolitician = promise.politician || promise.politicianId || "";
  const displayName = POLITICIAN_DISPLAY_NAMES[rawPolitician] || capitalizeWords(rawPolitician) || "Unknown Politician";

  let displayParty = promise.party && promise.party.trim() !== "" && promise.party !== "Party"
    ? capitalizeWords(promise.party)
    : POLITICIAN_PARTIES[displayName] || "Other Party";

  const promiseText = (promise.promise || promise.text || "").toLowerCase();
  const detailLink = promise.link || Object.entries(HARDCODED_LINKS).find(([key]) => promiseText.includes(key))?.[1];
  const displaySources = detailLink ? [detailLink, ...sources] : sources;

  return (
    <>
      <article className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-medium text-[15px] leading-snug">
            {promise.promise || promise.original_quote || promise.text}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-slate-500">{promise.politician || promise.politicianId || "Politician"}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">{displayParty}</span>
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
        {displaySources.length > 0 ? (
          displaySources.map((source, i) => {
            if (!source.startsWith("http")) {
              if (source === "PDF Extraction" || source === "PDF Extraction via Script") {
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (promise.pdfUrl) {
                        setShowPdfModal(true);
                      } else {
                        alert("The actual PDF document is not available for this promise because it was extracted before we started storing PDFs locally.");
                      }
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

      {showPdfModal && promise.pdfUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" 
          onClick={() => setShowPdfModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">📄</span> Extracted Document
              </h3>
              <button 
                onClick={() => setShowPdfModal(false)} 
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-2 md:p-4">
              <iframe 
                src={promise.pdfUrl} 
                className="w-full h-full rounded-lg shadow-sm bg-white" 
                title="PDF Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}