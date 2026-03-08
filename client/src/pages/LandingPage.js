import React, { useState } from "react";
import LoginButton from "../components/LoginButton";
import { useInView } from "../hooks/useInView";

function PreviewCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer max-w-sm mx-auto bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-200 transition-all duration-300 hover:-translate-y-1"
    >
      <p className="text-xs font-medium text-pink-600 mb-3">Hover to see progress</p>
      <p className="text-slate-900 font-medium mb-2">
        Build 1.4M homes by 2030
      </p>
      <p className="text-xs text-slate-500 mb-4">Housing • In Progress</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>{hovered ? "27" : "0"}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-700 ease-out"
            style={{ width: hovered ? "27%" : "0%" }}
          />
        </div>
      </div>
      {hovered && (
        <p className="mt-4 text-xs text-slate-500 animate-fade-in">
          Construction data shows ~380k started. On track but behind pace.
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [featuresRef, featuresInView] = useInView();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-sm shadow-slate-900/5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/25 ring-2 ring-white/50">
            P
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Pledgely</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 lg:pt-36 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(236,72,153,0.12),transparent)]" />
        <div className="absolute top-1/4 -right-32 w-[28rem] h-[28rem] bg-pink-300/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="hero-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-pink-700 text-sm font-medium mb-10 border border-pink-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
              </span>
              Political accountability, powered by AI
            </p>
            <h1 className="hero-item text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-slate-900 tracking-tight leading-[1.08]">
              Track political promises.
              <span className="block mt-2.5 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 bg-[length:200%_auto] animate-gradient">
                Hold leaders accountable.
              </span>
            </h1>
            <p className="hero-item mt-8 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Pledgely tracks promises from politicians over time, shows progress with
              AI-powered fact-checks, and connects statements to evidence.
            </p>
            <div className="hero-item mt-12 flex justify-center">
              <LoginButton variant="primary" />
            </div>
            <div className="hero-item mt-14 flex flex-wrap justify-center gap-2">
              {["Housing", "Climate", "Healthcare", "Economy", "Education", "Immigration"].map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-pink-50 hover:text-pink-700 transition-colors"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive preview */}
      <section className="relative py-20 lg:py-24 bg-white/50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
              See how it works
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Hover over the card to see a promise update with progress and rationale
            </p>
          </div>
          <PreviewCard />
        </div>
      </section>

      {/* Features */}
      <section
        ref={featuresRef}
        className={`relative py-24 lg:py-32 border-t border-slate-100 transition-all duration-700 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
            What you can do
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-20 text-lg">
            Everything you need to follow campaign promises and demand transparency
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Promise Database", desc: "Browse promises by politician, party, and topic. See status and progress in real time.", accent: "bg-pink-500" },
              { title: "AI Fact-Checks", desc: "Upload speeches. AI extracts claims, matches to promises, and verifies against evidence.", accent: "bg-rose-500" },
              { title: "Compare", desc: "Compare promise fulfillment across politicians on the same topic.", accent: "bg-pink-400" },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-pink-500/5 hover:border-pink-100 hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default"
                style={{ transitionDelay: featuresInView ? `${i * 100}ms` : 0 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-50 to-transparent rounded-tr-2xl rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-1 h-12 rounded-full ${item.accent} mb-6 group-hover:h-14 transition-all duration-300`} />
                <h3 className="font-semibold text-slate-900 text-lg mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Pledgely. Track promises. Demand accountability.
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient { animation: gradient 6s ease infinite; }

        .hero-item {
          opacity: 0;
          transform: translateY(12px);
          animation: heroReveal 0.6s ease forwards;
        }
        .hero-item:nth-child(1) { animation-delay: 0.1s; }
        .hero-item:nth-child(2) { animation-delay: 0.2s; }
        .hero-item:nth-child(3) { animation-delay: 0.35s; }
        .hero-item:nth-child(4) { animation-delay: 0.5s; }
        .hero-item:nth-child(5) { animation-delay: 0.65s; }
        .hero-item:nth-child(6) { animation-delay: 0.8s; }
        .hero-item:nth-child(5) { animation-delay: 1.1s; }
        @keyframes heroReveal {
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
