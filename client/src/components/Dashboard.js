import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

// Simple bar chart component (no external deps)
function MiniBarChart({ data, color = "pink" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colorMap = {
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 h-full">
          <div
            className={`w-full rounded-t ${colorMap[color] || colorMap.pink} transition-all duration-500`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-slate-500 truncate w-full text-center" title={d.label}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_COLORS = {
  "Fulfilled": "text-emerald-600",
  "In Progress": "text-blue-600",
  "Broken": "text-rose-600",
  "Pending": "text-amber-600",
  "Partially Completed": "text-orange-500",
};

export default function Dashboard({ onViewChange }) {
  const [promises, setPromises] = useState([]);
  const [politicians] = useState(["carney", "poilievre", "singh", "blanchet", "may"]);

  const fetchPromises = () => {
    return Promise.all(
      politicians.map((id) =>
        axios.get(`${API_BASE}/promises/${id}`).then((res) => res.data)
      )
    )
      .then((results) => setPromises(results.flat()))
      .catch(() => setPromises([]));
  };

  useEffect(() => {
    fetchPromises();
  }, []);
  // Real stats from MongoDB data
  const total = promises.length;
  const avgCompletion = total
    ? Math.round(promises.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / total)
    : 0;
  const fulfilled = promises.filter((p) => p.status === "Fulfilled").length;
  const broken = promises.filter((p) => p.status === "Broken").length;

  // Real topic chart data
  const topicCounts = promises.reduce((acc, p) => {
    const topic = p.topic || "Other";
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  const topicData = Object.entries(topicCounts).map(([label, value]) => ({ label, value }));

  // Real status chart data
  const statusCounts = promises.reduce((acc, p) => {
    const status = p.status || "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-500 rounded-2xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Pledgely</h1>
          <p className="text-pink-100 text-lg md:text-xl mb-8">
            The AI-powered political promise tracker. We use advanced language models to evaluate statements, track legislation, and hold politicians accountable to their word.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onViewChange && onViewChange("promises")}
              className="bg-white text-pink-600 hover:bg-slate-50 font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              See the Promises →
            </button>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-white opacity-10 blur-3xl transform translate-x-1/4 -translate-y-1/4 rounded-full pointer-events-none"></div>
      </div>

      {/* Real stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Promises</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{total}</p>
          <p className="text-xs text-slate-400 mt-1">Across all parties</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Avg. Completion</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{avgCompletion}%</p>
          <p className="text-xs text-slate-400 mt-1">Weighted by status</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Fulfilled</p>
          <p className="text-3xl font-bold text-pink-600 mt-1">{fulfilled}</p>
          <p className="text-xs text-slate-400 mt-1">Promises delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Broken</p>
          <p className="text-3xl font-bold text-rose-600 mt-1">{broken}</p>
          <p className="text-xs text-slate-400 mt-1">Promises not kept</p>
        </div>
      </div>

      {/* Real charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Promises by Topic</h3>
          {topicData.length > 0 ? <MiniBarChart data={topicData} color="pink" /> : <p className="text-slate-400 text-sm">Loading...</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Status Distribution</h3>
          {statusData.length > 0 ? <MiniBarChart data={statusData} color="emerald" /> : <p className="text-slate-400 text-sm">Loading...</p>}
        </div>
      </div>
    </div>
  );
}