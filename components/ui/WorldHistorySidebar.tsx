"use client";

import React, { useState } from "react";
import { useGrid, BlockType, WorldHistoryItem } from "@/context/GridContext";
import {
  ScrollText,
  Compass,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  Mountain,
  Trees,
  Cloud,
  Cpu,
} from "lucide-react";

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  Tavern: <Home className="w-3.5 h-3.5 text-[#d97706]" />,
  Mountain: <Mountain className="w-3.5 h-3.5 text-[#94a3b8]" />,
  Forest: <Trees className="w-3.5 h-3.5 text-[#22c55e]" />,
};

const BLOCK_BADGES: Record<BlockType, { bg: string; text: string; border: string }> = {
  Tavern: {
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-700/50",
  },
  Mountain: {
    bg: "bg-slate-800/40",
    text: "text-slate-300",
    border: "border-slate-600/50",
  },
  Forest: {
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-700/50",
  },
};

export const WorldHistorySidebar: React.FC = () => {
  const { worldHistory, openHistoryInCard } = useGrid();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Toggle button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed left-0 top-24 z-20 flex items-center gap-1.5 px-3 py-2 bg-dark-950/90 backdrop-blur-md border border-l-0 border-[#8a2be2] rounded-r-xl text-xs font-mono text-neon-purple hover:text-white hover:bg-neon-purple/20 transition-all shadow-[4px_0_15px_rgba(138,43,226,0.35)]"
          title="Expand World History"
        >
          <ScrollText className="w-4 h-4 text-neon-purple" />
          <span className="font-bold tracking-wider uppercase text-[11px]">History</span>
          <span className="px-1.5 py-0.2 rounded bg-neon-purple/20 border border-neon-purple/40 text-[10px]">
            {worldHistory.length}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Main World History Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-20 w-80 flex flex-col bg-dark-950/80 backdrop-blur-md border-r border-[#8a2be2] shadow-[4px_0_25px_rgba(138,43,226,0.2)] transition-transform duration-300 ease-in-out ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-800/90 bg-dark-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neon-purple/20 border border-neon-purple/50 shadow-neon-purple-sm">
              <ScrollText className="w-4 h-4 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                World History
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neon-purple/20 border border-neon-purple text-purple-200 font-mono">
                  {worldHistory.length}
                </span>
              </h2>
              <p className="text-[10px] text-gray-400 font-mono">Spatial Chronicle Feed</p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* History Entries Feed (Newest at top) */}
        <div className="flex-1 overflow-y-auto sleek-scrollbar p-3 space-y-3">
          {worldHistory.length > 0 ? (
            worldHistory.map((item: WorldHistoryItem) => {
              const badge = BLOCK_BADGES[item.blockType] || BLOCK_BADGES.Tavern;
              const isCloud = item.tier?.includes("Cloud");
              const isLocal = item.tier?.includes("Local");

              return (
                <div
                  key={item.id}
                  onClick={() => openHistoryInCard(item)}
                  className="group relative rounded-xl border border-dark-750 bg-dark-900/60 p-3 hover:bg-dark-850/80 hover:border-neon-purple/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(138,43,226,0.25)]"
                >
                  {/* Card Header: Block Badge & Coordinates */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-dark-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-dark-800 border border-dark-700">
                        {BLOCK_ICONS[item.blockType]}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {item.blockType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-neon-cyan font-bold">
                      <Compass className="w-3 h-3 text-neon-cyan/70" />
                      <span>X:{item.x}, Z:{item.z}</span>
                    </div>
                  </div>

                  {/* Truncated Lore Text */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3 group-hover:text-slate-100 transition-colors">
                    {item.truncatedLore}
                  </p>

                  {/* Card Footer: Tier Tag & Timestamp */}
                  <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] font-mono border-t border-dark-800/40 text-gray-500">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] ${
                        isCloud
                          ? "bg-purple-950/40 border-neon-purple/50 text-purple-300"
                          : isLocal
                          ? "bg-cyan-950/40 border-neon-cyan/50 text-cyan-300"
                          : "bg-dark-800 border-dark-700 text-gray-400"
                      }`}
                    >
                      {isCloud ? (
                        <Cloud className="w-2.5 h-2.5 text-neon-purple" />
                      ) : isLocal ? (
                        <Cpu className="w-2.5 h-2.5 text-neon-cyan" />
                      ) : null}
                      <span className="truncate max-w-[120px]">
                        {item.tier ? item.tier.replace(/ \(.*\)/, "") : "Lore"}
                      </span>
                    </span>

                    <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-dark-700 flex items-center justify-center text-neon-purple">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Chronicle Unwritten
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans max-w-[200px]">
                  Place a block on the 3D grid to trigger AI narrative generation and begin recording the world&apos;s history.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Indicator */}
        <div className="px-4 py-2 border-t border-dark-800/80 bg-dark-950/60 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-ping" />
            <span className="text-purple-300/80">Active Chronicle</span>
          </span>
          <span>Feed: Live</span>
        </div>
      </aside>
    </>
  );
};

