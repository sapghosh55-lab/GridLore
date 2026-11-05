"use client";

import React, { useState } from "react";
import { useGrid, BlockType } from "@/context/GridContext";
import {
  Sparkles,
  X,
  Compass,
  Layers,
  RefreshCw,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Radio,
  Home,
  Mountain,
  Trees,
} from "lucide-react";

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  Tavern: <Home className="w-4 h-4 text-[#d97706]" />,
  Mountain: <Mountain className="w-4 h-4 text-[#94a3b8]" />,
  Forest: <Trees className="w-4 h-4 text-[#22c55e]" />,
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

export const ContextCard: React.FC = () => {
  const { contextCard, closeContextCard, retryGenerateLore } = useGrid();
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!contextCard || !contextCard.isOpen) {
    return null;
  }

  const {
    blockType,
    x,
    z,
    adjacentBlocks,
    isLoading,
    loreText,
    backendOnline,
    payload,
    timestamp,
  } = contextCard;

  const handleCopy = () => {
    if (loreText) {
      navigator.clipboard.writeText(loreText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badgeStyle = BLOCK_BADGES[blockType];

  return (
    <div
      className={`fixed top-20 right-6 z-30 w-[390px] max-w-[calc(100vw-3rem)] rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 ${
        isLoading
          ? "bg-[#0b0716]/90 border border-neon-purple shadow-[0_0_30px_rgba(138,43,226,0.65),inset_0_0_15px_rgba(138,43,226,0.25)]"
          : "bg-[#080911]/90 border border-neon-cyan shadow-[0_0_25px_rgba(0,255,255,0.4),inset_0_0_15px_rgba(0,255,255,0.12)]"
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-dark-700/70 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isLoading
                ? "bg-neon-purple animate-ping"
                : "bg-neon-cyan shadow-[0_0_8px_#00ffff]"
            }`}
          />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
            Spatial Context Card
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                isLoading
                  ? "border-neon-purple text-neon-purple bg-neon-purple/20"
                  : "border-neon-cyan text-neon-cyan bg-neon-cyan/15"
              }`}
            >
              {isLoading ? "PROMPT SYNC" : "ACTIVE"}
            </span>
          </h2>
        </div>

        <button
          onClick={closeContextCard}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-dark-800 transition-colors"
          title="Dismiss Context Card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target Voxel Info & Coordinates */}
      <div className="flex items-center justify-between bg-dark-900/80 border border-dark-700/80 rounded-xl px-3.5 py-2.5 mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-dark-850 border border-dark-700">
            {BLOCK_ICONS[blockType]}
          </span>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">
              Placed Block
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{blockType}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                Voxel
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1 justify-end">
            <Compass className="w-3 h-3 text-neon-cyan" />
            Grid Pos
          </div>
          <div className="text-sm font-mono font-bold text-neon-cyan">
            x:{x}, z:{z}
          </div>
        </div>
      </div>

      {/* Detected Adjacent Blocks */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-mono">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neon-cyan" />
            ADJACENT BLOCKS ({adjacentBlocks.length})
          </span>
          <span className="text-[10px] text-gray-500">{timestamp}</span>
        </div>

        {adjacentBlocks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {adjacentBlocks.map((adj, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-850/90 border border-dark-700 text-xs text-gray-200 font-mono shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                <span className="font-semibold text-slate-100">{adj.block_type}</span>
                <span className="text-[10px] text-gray-400">
                  ({adj.direction})
                </span>
                <span className="text-[10px] text-neon-cyan">
                  [{adj.x},{adj.z}]
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic bg-dark-900/50 border border-dashed border-dark-700/70 rounded-lg px-3 py-2 text-center">
            No adjacent blocks detected — isolated terrain placement
          </div>
        )}
      </div>

      {/* Dynamic Content Area: Glowing Purple Loading State OR Generated Lore */}
      {isLoading ? (
        <div className="rounded-xl p-5 border border-neon-purple/70 bg-neon-purple/10 shadow-[0_0_20px_rgba(138,43,226,0.45)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
              <Sparkles className="w-3.5 h-3.5 text-neon-purple absolute animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-neon-purple tracking-wider uppercase flex items-center gap-1.5">
                <span>Synthesizing Spatial Lore</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-neon-purple animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 rounded-full bg-neon-purple animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-neon-purple animate-bounce" />
                </span>
              </div>
              <div className="text-[10px] text-purple-300/80 font-mono">
                POST http://localhost:8000/generate-lore
              </div>
            </div>
          </div>

          {/* Glowing Purple Skeleton Waves */}
          <div className="space-y-2 pt-1">
            <div className="h-3 rounded-md bg-gradient-to-r from-neon-purple/20 via-neon-purple/60 to-neon-purple/20 animate-pulse w-full" />
            <div className="h-3 rounded-md bg-gradient-to-r from-neon-purple/20 via-neon-purple/60 to-neon-purple/20 animate-pulse w-5/6 [animation-delay:0.15s]" />
            <div className="h-3 rounded-md bg-gradient-to-r from-neon-purple/20 via-neon-purple/60 to-neon-purple/20 animate-pulse w-3/4 [animation-delay:0.3s]" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dark-700/90 bg-dark-900/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neon-cyan tracking-wider uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Spatial Narrative</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
                title="Copy generated lore"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-neon-cyan" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={retryGenerateLore}
                className="p-1.5 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-dark-800 transition-colors"
                title="Re-generate lore"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lore Body Text */}
          <p className="text-sm text-slate-100 leading-relaxed font-sans bg-dark-950/40 p-3 rounded-lg border border-dark-800/80">
            {loreText}
          </p>

          {/* Connection Status Indicator */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-gray-400">
            <div className="flex items-center gap-1.5">
              <Radio
                className={`w-3 h-3 ${
                  backendOnline
                    ? "text-green-400 animate-pulse"
                    : "text-amber-400"
                }`}
              />
              <span>
                {backendOnline
                  ? "Backend connected (HTTP 200)"
                  : "Fallback mode (Backend at :8000 offline)"}
              </span>
            </div>

            <button
              onClick={() => setShowPayload(!showPayload)}
              className="flex items-center gap-1 text-neon-cyan hover:underline"
            >
              <Code2 className="w-3 h-3" />
              <span>JSON Payload</span>
              {showPayload ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Expandable JSON Payload Inspector */}
          {showPayload && (
            <div className="mt-2 p-2.5 rounded-lg bg-dark-950 border border-dark-800 overflow-x-auto text-[10px] font-mono text-cyan-300/90 max-h-40">
              <pre>{JSON.stringify(payload, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

