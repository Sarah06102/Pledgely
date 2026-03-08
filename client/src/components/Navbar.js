import React from "react";
import LogoutButton from "./LogoutButton";

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "promises", label: "Promise Database" },
  { id: "audit", label: "AI Auditor" },
  { id: "compare", label: "Compare" },
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
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  activeView === item.id
                    ? "border-pink-600 text-pink-700 bg-pink-50 shadow-sm"
                    : "border-slate-200 text-slate-600 bg-white/80 hover:border-pink-300 hover:text-pink-700 hover:bg-white"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(" ")[0]}</span>
              </button>
            ))}
            <LogoutButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
