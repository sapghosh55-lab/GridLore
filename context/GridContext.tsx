"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type BlockType = "Tavern" | "Mountain" | "Forest";

export interface VoxelBlockData {
  id: string;
  x: number;
  z: number;
  type: BlockType;
}

export interface NarrativeEvent {
  id: string;
  timestamp: string;
  text: string;
  type: BlockType | "System";
}

interface GridContextType {
  gridSize: number;
  blocks: Map<string, VoxelBlockData>;
  selectedType: BlockType;
  setSelectedType: (type: BlockType) => void;
  hoveredCoord: { x: number; z: number } | null;
  setHoveredCoord: (coord: { x: number; z: number } | null) => void;
  placeBlock: (x: number, z: number) => void;
  removeBlock: (x: number, z: number) => void;
  clearGrid: () => void;
  narrativeLogs: NarrativeEvent[];
}

const GridContext = createContext<GridContextType | undefined>(undefined);

const TAVERN_LORE = [
  "The Warm Hearth tavern raises its cedar beams. Hearth fires crackle as travelers seek shelter.",
  "Bards tune their lutes in the newly built tavern, singing songs of distant ruins.",
  "An iron lantern is hung outside the inn. Fresh cider and venison stew are served.",
  "A secretive wanderer in a hooded cloak takes a booth in the corner.",
];

const MOUNTAIN_LORE = [
  "Sheer obsidian spires thrust through the bedrock, catching the pale sky.",
  "The crags echo with howling winds. Ancient strata reveal veins of raw ore.",
  "Perpetual snow dusts the highest jagged ridges of the newly risen peak.",
  "Gargoyles of natural stone watch over the jagged mountain passes.",
];

const FOREST_LORE = [
  "Deep emerald canopy expands with ancient mossy roots and whispering pines.",
  "Bioluminescent blossoms unfurl along winding subterranean moss beds.",
  "Spirits of the deep timber awaken, rustling through the shadowed undergrowth.",
  "Canopy crowns interlock, shading the fertile soil in quiet mystique.",
];

export const GridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gridSize = 10;
  const [blocks, setBlocks] = useState<Map<string, VoxelBlockData>>(new Map());
  const [selectedType, setSelectedType] = useState<BlockType>("Tavern");
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; z: number } | null>(null);
  const [narrativeLogs, setNarrativeLogs] = useState<NarrativeEvent[]>([
    {
      id: "genesis",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      text: "GridLore initialized. 10x10 isometric narrative grid ready for creation.",
      type: "System",
    },
  ]);

  const addNarrative = useCallback((text: string, type: BlockType | "System") => {
    const entry: NarrativeEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      text,
      type,
    };
    setNarrativeLogs((prev) => [entry, ...prev.slice(0, 19)]);
  }, []);

  const placeBlock = useCallback(
    (x: number, z: number) => {
      const key = `${x},${z}`;
      setBlocks((prev) => {
        const next = new Map(prev);
        const existing = next.get(key);

        if (existing && existing.type === selectedType) {
          // Clicking an existing block of the same type removes it
          next.delete(key);
          addNarrative(`Demolished ${selectedType} at tile [${x}, ${z}].`, "System");
        } else {
          next.set(key, { id: key, x, z, type: selectedType });
          const loreList =
            selectedType === "Tavern"
              ? TAVERN_LORE
              : selectedType === "Mountain"
              ? MOUNTAIN_LORE
              : FOREST_LORE;
          const randomLore = loreList[Math.floor(Math.random() * loreList.length)];
          addNarrative(`[${x}, ${z}] ${randomLore}`, selectedType);
        }
        return next;
      });
    },
    [selectedType, addNarrative]
  );

  const removeBlock = useCallback(
    (x: number, z: number) => {
      const key = `${x},${z}`;
      setBlocks((prev) => {
        const next = new Map(prev);
        if (next.has(key)) {
          next.delete(key);
          addNarrative(`Removed block at [${x}, ${z}].`, "System");
        }
        return next;
      });
    },
    [addNarrative]
  );

  const clearGrid = useCallback(() => {
    setBlocks(new Map());
    addNarrative("Grid cleared. The realm is a blank slate.", "System");
  }, [addNarrative]);

  return (
    <GridContext.Provider
      value={{
        gridSize,
        blocks,
        selectedType,
        setSelectedType,
        hoveredCoord,
        setHoveredCoord,
        placeBlock,
        removeBlock,
        clearGrid,
        narrativeLogs,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) throw new Error("useGrid must be used within a GridProvider");
  return context;
};

