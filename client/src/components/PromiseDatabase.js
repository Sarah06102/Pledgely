import React, { useState, useEffect } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";
import SearchFilters from "./SearchFilters";

const API_BASE = "http://localhost:3000";

const POLITICIAN_NAMES = {
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

function capitalizeWords(str) {
  if (!str || typeof str !== "string") return str;
  return str.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export default function PromiseDatabase({ onViewChange }) {
  const [promises, setPromises] = useState([]);
  const [parties, setParties] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Fetch parties, promises, and topics (topics are dynamic from DB, including PDF-extracted ones)
    Promise.all([
      axios.get(`${API_BASE}/parties`).then((res) => res.data).catch(() => []),
      axios.get(`${API_BASE}/promises`).then((res) => res.data).catch(() => []),
      axios.get(`${API_BASE}/topics`).then((res) => res.data).catch(() => []),
    ]).then(([partiesData, promisesData, topicsData]) => {
      setParties(partiesData);
      setTopics(topicsData);
      const allPromises = promisesData.map((p) => {
        const rawId = p.politicianId || p.politician;
        const name = POLITICIAN_NAMES[rawId] || capitalizeWords(rawId) || "Unknown Politician";
        const party = p.party && p.party.trim() !== ""
          ? capitalizeWords(p.party)
          : (POLITICIAN_PARTIES[name] || "Other Party");

        return {
          id: p.id || p._id,
          promise: p.promise || p.text || p.original_quote,
          politician: name,
          party,
          topic: p.topic || "Other",
          status: p.status || "Pending",
          completion_percentage: p.completion_percentage || p.progress || 0,
          ai_reasoning: p.ai_reasoning || p.rationale || "",
          sources: p.sources || p.evidence_links || [],
          pdfUrl: p.pdfUrl,
        };
      });
      setPromises(allPromises);
      setLoading(false);
    });
  }, []);

  const filteredPromises = promises.filter((p) => {
    // 1. Status Filter
    if (filters.status && filters.status !== "All Status" && p.status !== filters.status) return false;

    // 2. Topic Filter
    if (filters.topic && filters.topic !== "All Topics" && p.topic !== filters.topic) return false;
    // 3. Party Filter
const derivedParty = POLITICIAN_PARTIES[p.politician] || p.party || "Other Party";

    if (filters.party && filters.party !== "All Parties") {
      const fp = filters.party.toLowerCase();
      const dp = derivedParty.toLowerCase();

      let isMatch = false;
      if (fp.includes("liberal") && dp.includes("liberal")) isMatch = true;
      if (fp.includes("conservative") && dp.includes("conservative")) isMatch = true;
      if ((fp.includes("ndp") || fp.includes("democratic")) && dp.includes("democratic")) isMatch = true;

      // Note: Party mapping might require joining, but string match for now
      if (!isMatch && (!p.party || p.party !== filters.party)) return false;
    }

    // 4. Keyword Search Filter
    if (filters.search) {
      const s = filters.search.toLowerCase();
      // Safely check if string includes substring
      const promiseText = p.promise ? p.promise.toLowerCase() : "";
      const politicianId = p.politician ? p.politician.toLowerCase() : "";
      const reasoningText = p.ai_reasoning ? p.ai_reasoning.toLowerCase() : "";

      if (!promiseText.includes(s) && !politicianId.includes(s) && !reasoningText.includes(s)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Promise Database</h2>
        <p className="text-slate-600 mt-1">Browse and filter political promises across parties and topics</p>
      </div>

      <SearchFilters parties={parties} topics={topics} onFilterChange={setFilters} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filteredPromises.length} promise{filteredPromises.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading promises...</div>
      ) : filteredPromises.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No promises match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromises.map((p) => (
            <PromiseCard key={p.id} promise={p} onViewChange={onViewChange} />
          ))}
        </div>
      )}
    </div>
  );
}