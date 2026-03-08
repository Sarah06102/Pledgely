import React, { useState, useRef } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [politicianId, setPoliticianId] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("video/") && !selected.type.startsWith("audio/")) {
        setError("Please select a video or audio file.");
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
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
      formData.append("file", file);
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
        <h2 className="text-2xl font-bold text-slate-900">Upload & Analyze</h2>
        <p className="text-slate-600 mt-1">
          Upload a speech or debate video. AI will extract claims, match them to promises, and fact-check.
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
            accept="video/*,audio/*"
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
              <span className="text-4xl block mb-2">🎬</span>
              <span className="font-medium">Click to select video or audio</span>
              <span className="block text-sm text-slate-500 mt-1">
                MP4, WebM, MOV, MP3, WAV
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
          <h3 className="font-semibold text-slate-900 mb-4">Analysis Results</h3>
          <pre className="p-4 bg-slate-50 rounded-lg text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 max-w-2xl">
        <h3 className="font-medium text-amber-800 mb-2">How to implement backend</h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          Add a <code className="bg-amber-100 px-1 rounded">POST /upload/analyze</code> endpoint that:
          1) Receives the file via multer/form-data; 2) Uploads video to Cloudinary; 3) Transcribes
          with Whisper or Gemini; 4) Uses Gemini API to extract claims; 5) Matches claims to promises
          in the DB; 6) Returns extracted claims, matched promises, and fact-check verdicts.
        </p>
      </div>
    </div>
  );
}
