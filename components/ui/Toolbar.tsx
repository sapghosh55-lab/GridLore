"use client";

import React from "react";
import { useGrid, BlockType } from "@/context/GridContext";
import { Home, Mountain, Trees, Trash2 } from "lucide-react";

export const Toolbar: React.FC = () => {
  const { selectedType, setSelectedType, clearGrid, blocks } = useGrid();

  const tools: {
    type: BlockType;
    label: string;
    icon: React.ReactNode;
    color: string;
    activeClass: string;
  }[] = [
    {
      type: "Tavern",
      label: "Tavern",
      icon: <Home className="w-5 h-5" />,
      color: "#8B4513",
      activeClass: "border-neon-purple shadow-neon-purple text-white bg-neon-purple/20",
    },
    {
      type: "Mountain",
      label: "Mountain",
      icon: <Mountain className="w-5 h-5" />,
      color: "#94a3b8",
      activeClass: "border-neon-cyan shadow-neon-cyan text-white bg-neon-cyan/20",
    },
    {
      type: "Forest",
      label: "Forest",
      icon: <Trees className="w-5 h-5" />,
      color: "#22c55e",
      activeClass: "border-neon-cyan shadow-neon-cyan text-white bg-neon-cyan/20",
    },
  ];

  const counts = Array.from(blocks.values()).reduce(
    (acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    },
    { Tavern: 0, Mountain: 0, Forest: 0 } as Record<BlockType, number>
  );

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-dark-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-dark-700 shadow-2xl">
      {/* 3 Selectable Block Types */}
      <div className="flex items-center gap-2">
        {tools.map((tool) => {
          const isActive = selectedType === tool.type;
          return (
            <button
              key={tool.type}
              onClick={() => setSelectedType(tool.type)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 border ${
                isActive
                  ? tool.activeClass
                  : "border-dark-700 hover:border-dark-600 text-gray-300 hover:text-white bg-dark-850"
              }`}
            >
              <span style={{ color: isActive ? "#ffffff" : tool.color }}>{tool.icon}</span>
              <span>{tool.label}</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-md bg-dark-950/70 text-gray-400 font-mono">
                {counts[tool.type]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-7 w-[1px] bg-dark-700 mx-1" />

      {/* Clear Grid Button */}
      <button
        onClick={clearGrid}
        title="Clear Canvas"
        className="p-2.5 rounded-xl border border-dark-700 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

