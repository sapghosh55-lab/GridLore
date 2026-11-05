"use client";

import React, { useState } from "react";
import { useGrid } from "@/context/GridContext";
import { ScrollText, ChevronDown, ChevronUp } from "lucide-react";

export const NarrativePanel: React.FC = () => {
  const { narrativeLogs } = useGrid();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="absolute top-20 right-6 z-20 w-80 flex flex-col bg-dark-950/85 backdrop-blur-md rounded-2xl border border-dark-700/80 shadow-2xl overflow-hidden transition-all duration-300">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-900/60 cursor-pointer hover:bg-dark-900/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-neon-purple" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Spatial Chronicle
          </h2>
        </div>
        <button className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-[360px] overflow-y-auto p-3 space-y-2 text-xs">
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

