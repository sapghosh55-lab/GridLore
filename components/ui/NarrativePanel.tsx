"use client";

import React, { useState } from "react";
import { useGrid } from "@/context/GridContext";
import { ScrollText, ChevronDown, ChevronUp } from "lucide-react";

export const NarrativePanel: React.FC = () => {
  const { narrativeLogs } = useGrid();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className="fixed bottom-24 right-6 z-20 w-80 flex flex-col bg-dark-950/85 backdrop-blur-md rounded-2xl border border-dark-700/80 shadow-2xl overflow-hidden transition-all duration-300">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 py-2.5 border-b border-dark-800 bg-dark-900/70 cursor-pointer hover:bg-dark-900/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-neon-purple" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Chronicle History
          </h2>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-dark-800 text-gray-400 font-mono">
            {narrativeLogs.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-[260px] overflow-y-auto p-3 space-y-2 text-xs">
          {narrativeLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl border transition-all ${
                log.type === "Tavern"
                  ? "border-amber-900/40 bg-amber-950/20 text-amber-200"
                  : log.type === "Forest"
                  ? "border-emerald-900/40 bg-emerald-950/20 text-emerald-200"
                  : log.type === "Mountain"
                  ? "border-slate-700/60 bg-slate-800/20 text-slate-200"
                  : "border-dark-700 bg-dark-900/40 text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-mono">
                <span className="uppercase font-semibold tracking-wider">
                  {log.type === "System" ? "System Log" : log.type}
                </span>
                <span>{log.timestamp}</span>
              </div>
              <p className="leading-relaxed">{log.text}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
