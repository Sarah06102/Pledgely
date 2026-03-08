import React, { useState, useEffect } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";
import SearchFilters from "./SearchFilters";

const API_BASE = "http://localhost:3000";

const POLITICIANS = ["carney", "poilievre", "singh"];

export default function PromiseDatabase() {
  const [promises, setPromises] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Fetch real promises from all politicians
    Promise.all([
      axios.get(`${API_BASE}/parties`).then((res) => res.data).catch(() => []),
      ...POLITICIANS.map((id) =>
        axios.get(`${API_BASE}/promises/${id}`).then((res) => res.data).catch(() => [])
      ),
    ]).then(([partiesData, ...promiseArrays]) => {
      setParties(partiesData);
      // Normalize MongoDB fields to match what PromiseCard expects
      const allPromises = promiseArrays.flat().map((p) => {
        let name = p.politicianId || p.politician;
        if (name === "carney") name = "Mark Carney";
        else if (name === "poilievre") name = "Pierre Poilievre";
        else if (name === "singh") name = "Jagmeet Singh";

        return {
          id: p._id,
          promise: p.text || p.promise,
          politician: name,
          party: p.party || "",
          topic: p.topic || "Other",
          status: p.status || "Pending",
          completion_percentage: p.completion_percentage || 0,
          ai_reasoning: p.ai_reasoning || "",
          sources: p.sources || [],
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
    const derivedParty = p.politician === "Mark Carney" || p.politician === "carney" ? "Liberal Party"
      : p.politician === "Pierre Poilievre" || p.politician === "poilievre" ? "Conservative Party"
        : p.politician === "Jagmeet Singh" || p.politician === "singh" ? "New Democratic Party" : "Other";

    if (filters.party && filters.party !== "All Parties") {
      const fp = filters.party.toLowerCase();
      const dp = derivedParty.toLowerCase();

      let isMatch = false;
      if (fp.includes("liberal") && dp.includes("liberal")) isMatch = true;
      if (fp.includes("conservative") && dp.includes("conservative")) isMatch = true;
      if ((fp.includes("ndp") || fp.includes("democratic")) && dp.includes("democratic")) isMatch = true;

      if (!isMatch) return false;
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

      <SearchFilters parties={parties} onFilterChange={setFilters} />

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
            <PromiseCard key={p.id} promise={p} />
          ))}
        </div>
      )}
    </div>
  );
}