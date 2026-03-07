import React, { useState, useEffect } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";
import SearchFilters from "./SearchFilters";

const API_BASE = "http://localhost:3000";

// Demo data when API returns mock data
const DEMO_PROMISES = [
  {
    id: "1",
    promise: "Build 1.4M homes by 2030",
    original_quote: "Build 1.4M homes by 2030",
    politician: "Justin Trudeau",
    party: "Liberal",
    topic: "Housing",
    status: "In Progress",
    completion_percentage: 27,
    rationale: "Construction data shows ~380k homes started. On track but behind target pace.",
    election: "Election 2025",
    evidence_links: [],
  },
  {
    id: "2",
    promise: "Net-zero emissions by 2050",
    original_quote: "Net-zero emissions by 2050",
    politician: "Justin Trudeau",
    party: "Liberal",
    topic: "Climate",
    status: "In Progress",
    completion_percentage: 42,
    rationale: "Carbon pricing and clean energy investments underway. Key milestones met.",
    election: "Election 2025",
  },
  {
    id: "3",
    promise: "Cut income taxes by 10% in first year",
    original_quote: "Cut income taxes by 10% in first year",
    politician: "Pierre Poilievre",
    party: "Conservative",
    topic: "Economy",
    status: "Pending",
    completion_percentage: 0,
    rationale: "Campaign promise. No legislative action yet.",
    election: "Election 2025",
  },
];

export default function PromiseDatabase() {
  const [promises, setPromises] = useState(DEMO_PROMISES);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/parties`)
      .then((res) => setParties(res.data || []))
      .catch(() => setParties([]))
      .finally(() => setLoading(false));
  }, []);

  // In a full app, load promises from API with filters
  const filteredPromises = promises.filter((p) => {
    if (filters.status && filters.status !== "All Status" && p.status !== filters.status) return false;
    if (filters.topic && filters.topic !== "All Topics" && p.topic !== filters.topic) return false;
    if (filters.party && filters.party !== "All Parties" && p.party !== filters.party) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (
        !(
          (p.promise || "").toLowerCase().includes(s) ||
          (p.politician || "").toLowerCase().includes(s)
        )
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Promise Database</h2>
        <p className="text-slate-600 mt-1">Browse and filter political promises across parties and topics</p>
      </div>

      <SearchFilters parties={parties} onFilterChange={setFilters} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filteredPromises.length} promise{filteredPromises.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading promises...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromises.map((p) => (
            <PromiseCard key={p.id} promise={p} />
          ))}
        </div>
      )}
    </div>
  );
}
