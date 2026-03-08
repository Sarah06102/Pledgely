import React, { useState, useRef } from "react";
import axios from "axios";
import PromiseCard from "./PromiseCard";

const API_BASE = "http://localhost:3000";

export default function VideoUpload({ onViewChange }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("lastAuditResult");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [politicianId, setPoliticianId] = useState("");
  const fileInputRef = useRef(null);

  // Persist result to localStorage whenever it changes
  React.useEffect(() => {
    if (result) {
      localStorage.setItem("lastAuditResult", JSON.stringify(result));
    } else {
      localStorage.removeItem("lastAuditResult");
    }
  }, [result]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("Please select a PDF file.");
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("auditPdf", file);
      if (politicianId) formData.append("politicianId", politicianId);

      const res = await axios.post(`${API_BASE}/upload/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Upload or analysis failed. Ensure the backend has the /upload/analyze endpoint."
      );
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Document Audit</h2>
        <p className="text-slate-600 mt-1">
          Upload an official party platform or government document (PDF). AI will extract promises, match them, and update their status.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            file ? "border-pink-300 bg-pink-50/50" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div>
              <p className="font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={reset}
                className="mt-2 text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Choose different file
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <span className="text-4xl block mb-2">📄</span>
              <span className="font-medium">Click to select a PDF</span>
              <span className="block text-sm text-slate-500 mt-1">
                Only PDF files are supported
              </span>
            </button>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Politician (optional — helps match to promises)
          </label>
          <input
            type="text"
            placeholder="e.g. Mark Carney"
            value={politicianId}
            onChange={(e) => setPoliticianId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          />
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading || analyzing}
            className="px-5 py-2.5 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading || analyzing ? "Processing…" : "Upload & Analyze"}
          </button>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4 text-xl">Analysis Results</h3>
          
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col items-center shadow-sm">
              <span className="text-3xl font-bold text-emerald-700">{result.summary?.fulfilled || 0}</span>
              <span className="text-sm font-medium text-emerald-800 mt-1">Fulfilled</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center shadow-sm">
              <span className="text-3xl font-bold text-blue-700">{result.summary?.inProgress || 0}</span>
              <span className="text-sm font-medium text-blue-800 mt-1">In Progress</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex flex-col items-center shadow-sm">
              <span className="text-3xl font-bold text-amber-700">{result.summary?.pending || 0}</span>
              <span className="text-sm font-medium text-amber-800 mt-1">Pending</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 flex flex-col items-center shadow-sm">
              <span className="text-3xl font-bold text-rose-700">{result.summary?.broken || 0}</span>
              <span className="text-sm font-medium text-rose-800 mt-1">Broken</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {result.results?.map((promise) => (
              <PromiseCard key={promise.id} promise={promise} onViewChange={onViewChange} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
