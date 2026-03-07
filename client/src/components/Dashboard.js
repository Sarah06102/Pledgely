import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

// Simple bar chart component (no external deps)
function MiniBarChart({ data, color = "blue" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colorMap = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${colorMap[color] || colorMap.blue}`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [parties, setParties] = useState([]);
  const [promisesSummary, setPromisesSummary] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/parties`)
      .then((res) => setParties(res.data))
      .catch(() => setParties([]));
  }, []);

  // Demo data for visualization
  const topicData = [
    { label: "Housing", value: 45 },
    { label: "Climate", value: 28 },
    { label: "Health", value: 62 },
    { label: "Economy", value: 38 },
    { label: "Other", value: 22 },
  ];

  const statusData = [
    { label: "In Progress", value: 42 },
    { label: "Fulfilled", value: 18 },
    { label: "Pending", value: 35 },
    { label: "Broken", value: 5 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">Overview of political promise progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Promises</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">156</p>
          <p className="text-xs text-slate-400 mt-1">Across all parties</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Avg. Completion</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">38%</p>
          <p className="text-xs text-slate-400 mt-1">Weighted by status</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Fulfilled</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">28</p>
          <p className="text-xs text-slate-400 mt-1">Promises delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Flagged</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">12</p>
          <p className="text-xs text-slate-400 mt-1"> inconsistencies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Promises by Topic</h3>
          <MiniBarChart data={topicData} color="blue" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Status Distribution</h3>
          <MiniBarChart data={statusData} color="emerald" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {[
            { text: "Build 1.4M homes by 2030 — Updated: 27% completed", time: "2h ago" },
            { text: "Net-zero by 2050 — New evidence added", time: "5h ago" },
            { text: "Healthcare wait times — AI verdict: Partially True", time: "1d ago" },
          ].map((item, i) => (
            <li key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{item.text}</span>
              <span className="text-xs text-slate-400">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
