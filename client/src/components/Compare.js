import React, { useState } from "react";

const TOPICS = ["Housing", "Climate", "Healthcare", "Economy"];
const SAMPLE_COMPARISON = [
  { politician: "Justin Trudeau", topic: "Housing", status: "In Progress", progress: 27 },
  { politician: "Pierre Poilievre", topic: "Housing", status: "Pending", progress: 0 },
  { politician: "Mark Carney", topic: "Housing", status: "In Progress", progress: 15 },
];

export default function Compare() {
  const [topic, setTopic] = useState("Housing");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Compare Politicians</h2>
        <p className="text-slate-600 mt-1">
          Compare promise fulfillment across politicians on a single topic
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-600 mb-3">
          Select topic to compare
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                Politician
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Topic</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Progress</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_COMPARISON.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.politician}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{row.topic}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === "In Progress"
                        ? "bg-pink-100 text-pink-800"
                        : row.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px] overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600">{row.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
