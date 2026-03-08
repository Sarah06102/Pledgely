import React, { useState } from "react";

const TOPICS = ["All Topics", "Housing", "Climate", "Healthcare", "Economy", "Education", "Immigration"];
const STATUSES = ["All Status", "In Progress", "Fulfilled", "Pending", "Broken", "Delayed"];
const PARTIES = ["All Parties", "Liberal", "Conservative", "NDP", "Green", "Bloc"];

export default function SearchFilters({ onFilterChange, parties = [], politicians = [] }) {
  const [topic, setTopic] = useState("All Topics");
  const [status, setStatus] = useState("All Status");
  const [party, setParty] = useState("All Parties");
  const [search, setSearch] = useState("");

  const applyFilters = () => {
    onFilterChange({ topic, status, party, search });
  };

  const clearFilters = () => {
    setTopic("All Topics");
    setStatus("All Status");
    setParty("All Parties");
    setSearch("");
    onFilterChange({ topic: "All Topics", status: "All Status", party: "All Parties", search: "" });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
          <input
            type="search"
            placeholder="Search promises, politicians..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Party</label>
          <select
            value={party}
            onChange={(e) => setParty(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            {(parties.length > 0 ? ["All Parties", ...parties.map(p => p.name)] : PARTIES).map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={applyFilters}
          className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
