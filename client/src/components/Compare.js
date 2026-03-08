import React, { useState, useEffect } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";

const API_BASE = "http://localhost:3000";

const POLITICIANS = ["carney", "poilievre", "singh", "blanchet", "may"];
const DEFAULT_TOPICS = ["Housing", "Climate", "Healthcare", "Economy", "Education", "Immigration"];

const POLITICIAN_NAMES = {
  carney: "Mark Carney",
  poilievre: "Pierre Poilievre",
  singh: "Jagmeet Singh",
blanchet: "Yves-Francois Blanchet",
  may: "Elizabeth May",
};

function capitalizeWords(str) {
  if (!str || typeof str !== "string") return str;
  return str.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export default function Compare({ onViewChange }) {
  const [topic, setTopic] = useState("Housing");
  const [polA, setPolA] = useState("Mark Carney");
  const [polB, setPolB] = useState("Pierre Poilievre");
  const [promises, setPromises] = useState([]);
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    Promise.all([
      ...POLITICIANS.map((id) =>
        axios.get(`${API_BASE}/promises/${id}`).then((res) => res.data).catch(() => [])
      ),
      axios.get(`${API_BASE}/topics`).then((res) => res.data).catch(() => []),
    ]).then((results) => {
      const promiseArrays = results.slice(0, -1);
      const topicsData = results[results.length - 1];
      if (Array.isArray(topicsData) && topicsData.length > 0) setTopics(topicsData);
      const allPromises = promiseArrays.flat().map((p) => ({
        id: p._id,
        promise: p.text || p.promise,
        politician: POLITICIAN_NAMES[p.politicianId] || capitalizeWords(p.politicianId) || "Unknown Politician",
        topic: p.topic || "Other",
        status: p.status || "Pending",
        completion_percentage: p.completion_percentage || 0,
        ai_reasoning: p.ai_reasoning || "",
        sources: p.sources || [],
      }));
      setPromises(allPromises);
      setLoading(false);
    });
  }, []);

  const toggleRow = (name) => {
    setExpandedRows((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getStats = (politicianName) => {
    const relevant = promises.filter(
      (p) => p.politician === politicianName && p.topic.toLowerCase() === topic.toLowerCase()
    );
    if (relevant.length === 0) return { score: 0, status: "No Data", promises: [] };
    const avg = Math.round(relevant.reduce((sum, p) => sum + p.completion_percentage, 0) / relevant.length);
    let status = "Pending";
    if (avg > 0) status = "In Progress";
    if (avg >= 100) status = "Fulfilled";
    return { score: avg, status, promises: relevant };
  };

  const renderRow = (name) => {
    const stats = getStats(name);
    const isExpanded = !!expandedRows[name];

    return (
      <React.Fragment key={name}>
        <tr
          className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => toggleRow(name)}
        >
          <td className="px-6 py-4 text-sm font-medium text-slate-900">
            <div className="flex items-center gap-2">
<svg className={`w-4 h-4 shrink-0 text-slate-500 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {name}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-slate-600">{topic}</td>
          <td className="px-6 py-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.status === "In Progress" ? "bg-blue-100 text-blue-800"
              : stats.status === "Fulfilled" ? "bg-emerald-100 text-emerald-800"
              : stats.status === "No Data" ? "bg-slate-100 text-slate-500"
              : "bg-amber-100 text-amber-800"
            }`}>
              {stats.status}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.score}%` }} />
              </div>
              <span className="text-sm text-slate-600">{stats.score}%</span>
            </div>
          </td>
        </tr>

        {isExpanded && (
          <tr className="bg-slate-50 border-b border-slate-200">
            <td colSpan="4" className="px-6 py-6">
              <div className="text-sm font-semibold text-slate-700 mb-4">
                {name}'s {topic} Promises ({stats.promises.length})
              </div>
              {stats.promises.length === 0 ? (
                <div className="text-slate-500 italic">No promises found for this topic.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {stats.promises.map((p) => (
                    <PromiseCard key={p.id} promise={p} onViewChange={onViewChange} />
                  ))}
                </div>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Compare Politicians</h2>
        <p className="text-slate-600 mt-1">
          Select two politicians and an issue to see how their promises stack up.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Politician A</label>
          <select
            value={polA}
            onChange={(e) => setPolA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
          >
            <option value="Mark Carney">Mark Carney (LPC)</option>
            <option value="Pierre Poilievre">Pierre Poilievre (CPC)</option>
            <option value="Jagmeet Singh">Jagmeet Singh (NDP)</option>
            <option value="Yves-Francois Blanchet">Yves-Francois Blanchet (BQ)</option>
            <option value="Elizabeth May">Elizabeth May (Green)</option>
          </select>
        </div>

        <div className="flex items-center justify-center font-bold text-slate-400 pb-2 px-2">VS</div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Politician B</label>
          <select
            value={polB}
            onChange={(e) => setPolB(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
          >
            <option value="Pierre Poilievre">Pierre Poilievre (CPC)</option>
            <option value="Mark Carney">Mark Carney (LPC)</option>
            <option value="Jagmeet Singh">Jagmeet Singh (NDP)</option>
            <option value="Yves-Francois Blanchet">Yves-Francois Blanchet (BQ)</option>
            <option value="Elizabeth May">Elizabeth May (Green)</option>
          </select>
        </div>

        <div className="flex-1 w-full mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
          <label className="block text-sm font-medium text-slate-600 mb-2">Select Issue</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-semibold text-pink-700 bg-pink-50"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading comparison data...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Politician</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Overall Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Average Progress</th>
              </tr>
            </thead>
            <tbody>
              {renderRow(polA)}
              {renderRow(polB)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}