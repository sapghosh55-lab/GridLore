"use client";

import React from "react";
import { useGrid } from "@/context/GridContext";
import { Compass, Sparkles, Box } from "lucide-react";

export const Header: React.FC = () => {
  const { hoveredCoord, blocks } = useGrid();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neon-purple/20 border border-neon-purple flex items-center justify-center shadow-neon-purple-sm">
          <Sparkles className="w-5 h-5 text-neon-cyan" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wider text-white flex items-center gap-2">
            GRID<span className="text-neon-cyan">LORE</span>
            <span className="text-[10px] tracking-widest px-2 py-0.5 rounded bg-neon-purple/20 border border-neon-purple text-neon-purple font-mono uppercase">
              10x10 Voxel
            </span>
          </h1>
          <p className="text-xs text-gray-400">3D Spatial Narrative Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-700 text-gray-300">
          <Compass className="w-4 h-4 text-neon-cyan" />
          <span>COORDINATES:</span>
          <span className="text-neon-cyan font-bold min-w-[50px]">
            {hoveredCoord ? `(${hoveredCoord.x}, ${hoveredCoord.z})` : "---"}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-700 text-gray-300">
          <Box className="w-4 h-4 text-neon-purple" />
          <span>PLACED:</span>
          <span className="text-neon-purple font-bold">{blocks.size}</span>
          <span className="text-gray-500">/ 100</span>
        </div>
      </div>
    </header>
  );
};

