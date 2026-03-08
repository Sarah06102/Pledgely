import React from "react";
import LogoutButton from "./LogoutButton";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "promises", label: "Promise Database", icon: "📋" },
  { id: "audit", label: "AI Auditor", icon: "📄" },
  { id: "compare", label: "Compare", icon: "⚖️" },
];

export default function Navbar({ activeView, onViewChange }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              P
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pledgely
            </h1>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? "bg-pink-50 text-pink-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
