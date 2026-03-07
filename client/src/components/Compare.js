import React, { useState, useEffect } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";

const API_BASE = "http://localhost:3000";
const POLITICIANS = ["carney", "poilievre", "singh"];
const TOPICS = ["Housing", "Climate", "Healthcare", "Economy"];

export default function Compare() {
  const [topic, setTopic] = useState("Housing");
  const [polA, setPolA] = useState("Mark Carney");
  const [polB, setPolB] = useState("Pierre Poilievre");

  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({}); // { "Mark Carney": true }

  useEffect(() => {
    // Fetch real promises
    Promise.all([
      ...POLITICIANS.map((id) =>
        axios.get(`${API_BASE}/promises/${id}`).then((res) => res.data).catch(() => [])
      ),
    ]).then((promiseArrays) => {
      const allPromises = promiseArrays.flat().map((p) => {
        let name = p.politicianId || p.politician;
        if (name === "carney") name = "Mark Carney";
        else if (name === "poilievre") name = "Pierre Poilievre";
        else if (name === "singh") name = "Jagmeet Singh";

        return {
          id: p._id,
          promise: p.text || p.promise,
          politician: name,
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

  const toggleRow = (politicianName) => {
    setExpandedRows(prev => ({ ...prev, [politicianName]: !prev[politicianName] }));
  };

  // Helper to get stats for a specific politician and topic
  const getStats = (politicianName) => {
    const relevantPromises = promises.filter(
      p => p.politician === politicianName && p.topic.toLowerCase() === topic.toLowerCase()
    );

    if (relevantPromises.length === 0) {
      return { score: 0, status: "No Data", promises: [] };
    }

    const totalScore = relevantPromises.reduce((sum, p) => sum + p.completion_percentage, 0);
    const avgScore = Math.round(totalScore / relevantPromises.length);

    let status = "Pending";
    if (avgScore > 0) status = "In Progress";
    if (avgScore >= 100) status = "Fulfilled";

    return { score: avgScore, status, promises: relevantPromises };
  };

  const statsA = getStats(polA);
  const statsB = getStats(polB);

  const renderPoliticianRow = (stats, name) => {
    const isExpanded = !!expandedRows[name];

    return (
      <React.Fragment key={name}>
        <tr
          className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => toggleRow(name)}
        >
          <td className="px-6 py-4 text-sm font-medium text-slate-900">
            <div className="flex items-center gap-2">
              <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
              {name}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-slate-600">{topic}</td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${stats.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : stats.status === "Pending" || stats.status === "No Data"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
            >
              {stats.status}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px] overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stats.score}%` }}
                />
              </div>
              <span className="text-sm text-slate-600">{stats.score}%</span>
            </div>
          </td>
        </tr>
        {/* Expanded Sub-Row showing the actual cards */}
        {isExpanded && (
          <tr className="bg-slate-50 border-b border-slate-200">
            <td colSpan="4" className="px-6 py-6">
              <div className="text-sm font-semibold text-slate-700 mb-4">{name}'s {topic} Promises ({stats.promises.length})</div>
              {stats.promises.length === 0 ? (
                <div className="text-slate-500 italic">No promises found for this topic.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {stats.promises.map(p => (
                    <PromiseCard key={p.id} promise={p} />
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
          Select two politicians and an issue to see how their exact promises stack up.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Politician A</label>
          <select
            value={polA}
            onChange={(e) => setPolA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Mark Carney">Mark Carney (LPC)</option>
            <option value="Pierre Poilievre">Pierre Poilievre (CPC)</option>
            <option value="Jagmeet Singh">Jagmeet Singh (NDP)</option>
          </select>
        </div>

        <div className="flex items-center justify-center font-bold text-slate-400 pb-2 px-2">VS</div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Politician B</label>
          <select
            value={polB}
            onChange={(e) => setPolB(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Pierre Poilievre">Pierre Poilievre (CPC)</option>
            <option value="Mark Carney">Mark Carney (LPC)</option>
            <option value="Jagmeet Singh">Jagmeet Singh (NDP)</option>
          </select>
        </div>

        <div className="flex-1 w-full mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
          <label className="block text-sm font-medium text-slate-600 mb-2">Select Issue</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-700 bg-blue-50"
          >
            {TOPICS.map((t) => (
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Politician (Click to view cards)</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Overall Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Average Progress</th>
              </tr>
            </thead>
            <tbody>
              {renderPoliticianRow(statsA, polA)}
              {renderPoliticianRow(statsB, polB)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
