import React from "react";
import LoginButton from "../components/LoginButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg">
            P
          </div>
          <span className="text-xl font-bold text-slate-900">Pledgely</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-rose-500/5 to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Track political promises.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                Hold leaders accountable.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Pledgely tracks promises from politicians over time, shows progress with
              AI-powered fact-checks, and connects statements to evidence.
            </p>
            <div className="mt-10 flex justify-center">
              <LoginButton variant="primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
          What you can do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-2xl mb-4">
              📋
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Promise Database</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Browse promises by politician, party, and topic. See status and progress.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">AI Fact-Checks</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload speeches. AI extracts claims, matches to promises, and verifies.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              ⚖️
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Compare</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Compare promise fulfillment across politicians on the same topic.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to hold leaders accountable?</h2>
          <p className="mt-2 text-slate-400">Sign up to contribute and get updates.</p>
        </div>
      </section>
    </div>
  );
}
