"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type BlockType = "Tavern" | "Mountain" | "Forest";

export interface VoxelBlockData {
  id: string;
  x: number;
  z: number;
  type: BlockType;
}

export interface AdjacentBlock {
  block_type: BlockType;
  type: BlockType;
  x: number;
  z: number;
  direction: string;
}

export interface ContextCardState {
  isOpen: boolean;
  blockType: BlockType;
  x: number;
  z: number;
  adjacentBlocks: AdjacentBlock[];
  isLoading: boolean;
  loreText: string | null;
  tier?: string | null;
  similarityScores?: { quick_dialogue?: number; deep_historical_lore?: number } | null;
  error: string | null;
  backendOnline: boolean | null;
  payload: {
    block_type: BlockType;
    x: number;
    z: number;
    adjacent_blocks: AdjacentBlock[];
  };
  timestamp: string;
}

export interface NarrativeEvent {
  id: string;
  timestamp: string;
  text: string;
  type: BlockType | "System";
  tier?: string | null;
}

interface GridContextType {
  gridSize: number;
  blocks: Map<string, VoxelBlockData>;
  selectedType: BlockType;
  setSelectedType: (type: BlockType) => void;
  hoveredCoord: { x: number; z: number } | null;
  setHoveredCoord: (coord: { x: number; z: number } | null) => void;
  placeBlock: (x: number, z: number) => Promise<void>;
  removeBlock: (x: number, z: number) => void;
  clearGrid: () => void;
  narrativeLogs: NarrativeEvent[];
  contextCard: ContextCardState | null;
  closeContextCard: () => void;
  retryGenerateLore: () => Promise<void>;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

const NEIGHBOR_DELTAS = [
  { dx: 0, dz: -1, direction: "North" },
  { dx: 1, dz: 0, direction: "East" },
  { dx: 0, dz: 1, direction: "South" },
  { dx: -1, dz: 0, direction: "West" },
  { dx: 1, dz: -1, direction: "North-East" },
  { dx: -1, dz: -1, direction: "North-West" },
  { dx: 1, dz: 1, direction: "South-East" },
  { dx: -1, dz: 1, direction: "South-West" },
];

export const getAdjacentBlocks = (
  x: number,
  z: number,
  blocksMap: Map<string, VoxelBlockData>
): AdjacentBlock[] => {
  const adjacent: AdjacentBlock[] = [];
  for (const { dx, dz, direction } of NEIGHBOR_DELTAS) {
    const nx = x + dx;
    const nz = z + dz;
    const key = `${nx},${nz}`;
    const neighbor = blocksMap.get(key);
    if (neighbor) {
      adjacent.push({
        block_type: neighbor.type,
        type: neighbor.type,
        x: nx,
        z: nz,
        direction,
      });
    }
  }
  return adjacent;
};

export const generateFallbackLore = (
  blockType: BlockType,
  x: number,
  z: number,
  adjacent: AdjacentBlock[]
): string => {
  if (adjacent.length === 0) {
    switch (blockType) {
      case "Tavern":
        return `An isolated tavern, "The Far Traveler", lights its lanterns at coordinates (${x}, ${z}). Hearth fires crackle as wanderers seek refuge on the frontier.`;
      case "Mountain":
        return `A solitary stone peak thrusts into the heavens at (${x}, ${z}), shrouded in cold winds and untouched obsidian silence.`;
      case "Forest":
        return `An ancient lone grove sprouts at (${x}, ${z}), its primordial roots sinking deep into the fertile earth with whispering pines.`;
    }
  }

  const adjTypes = adjacent.map((a) => a.block_type);
  const hasMountain = adjTypes.includes("Mountain");
  const hasForest = adjTypes.includes("Forest");

  if (blockType === "Tavern") {
    if (hasMountain && hasForest) {
      return `Nestled between towering alpine ridges and whispering woodlands at (${x}, ${z}), this Tavern thrives as a legendary frontier crossroads for mountaineers, woodcutters, and wandering spellweavers.`;
    }
    if (hasMountain) {
      return `Built into the rocky foothills of the adjacent Mountain peak at (${x}, ${z}), this Tavern serves spiced mead and warmth to weary climbers seeking shelter from high-altitude storms.`;
    }
    if (hasForest) {
      return `Under the lush whispering canopy of the neighbouring Forest at (${x}, ${z}), this woodland inn offers quiet rest, herbal ales, and shelter from the untamed wild.`;
    }
    return `Expanding the settlement alongside another Tavern at (${x}, ${z}), the sounds of lively fiddles and clinking tankards echo through the valley.`;
  }

  if (blockType === "Mountain") {
    if (hasForest) {
      return `Sheer granite crags rise steeply above the neighboring Forest at (${x}, ${z}). Mountain mists spill downward, feeding deep mosses and alpine pine glades.`;
    }
    return `Towering jagged ridges cast long evening shadows across (${x}, ${z}), protecting the surrounding lowlands from severe arctic winds.`;
  }

  // Forest
  if (hasMountain) {
    return `Verdant pine groves scale the rocky cliffs of the nearby Mountain at (${x}, ${z}), their ancient roots digging deep into fissures of stone.`;
  }
  return `The emerald forest expands across (${x}, ${z}), its interconnected canopies forming a vast, enchanted wilderness.`;
};

export const GridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gridSize = 10;
  const [blocks, setBlocks] = useState<Map<string, VoxelBlockData>>(new Map());
  const [selectedType, setSelectedType] = useState<BlockType>("Tavern");
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; z: number } | null>(null);
  const [contextCard, setContextCard] = useState<ContextCardState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [narrativeLogs, setNarrativeLogs] = useState<NarrativeEvent[]>([
    {
      id: "genesis",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      text: "GridLore initialized. 10x10 isometric narrative grid ready for creation.",
      type: "System",
    },
  ]);

  const addNarrative = useCallback(
    (text: string, type: BlockType | "System", tier?: string | null) => {
      const entry: NarrativeEvent = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        text,
        type,
        tier,
      };
      setNarrativeLogs((prev) => [entry, ...prev.slice(0, 24)]);
    },
    []
  );

  const closeContextCard = useCallback(() => {
    setContextCard((prev) => (prev ? { ...prev, isOpen: false } : null));
  }, []);

  const sendGenerateLoreRequest = useCallback(
    async (
      blockType: BlockType,
      x: number,
      z: number,
      adjacent: AdjacentBlock[]
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const payload = {
        block_type: blockType,
        x,
        z,
        adjacent_blocks: adjacent,
      };

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Show Context Card in loading state
      setContextCard({
        isOpen: true,
        blockType,
        x,
        z,
        adjacentBlocks: adjacent,
        isLoading: true,
        loreText: null,
        tier: null,
        similarityScores: null,
        error: null,
        backendOnline: null,
        payload,
        timestamp,
      });

      try {
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch("http://localhost:8000/generate-lore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let loreResult = "";
        let tier: string | null = null;
        let similarityScores = null;

        try {
          const data = await response.json();
          if (typeof data === "string") {
            loreResult = data;
          } else if (typeof data === "object" && data !== null) {
            loreResult =
              data.dummy_lore ||
              data.lore ||
              data.text ||
              data.generated_lore ||
              data.narrative ||
              data.story ||
              data.content ||
              data.message ||
              JSON.stringify(data, null, 2);
            tier = data.tier || null;
            similarityScores = data.similarity_scores || null;
          }
        } catch {
          loreResult = await response.text();
        }

        if (!loreResult) {
          loreResult = generateFallbackLore(blockType, x, z, adjacent);
        }

        setContextCard((prev) =>
          prev
            ? {
                ...prev,
                isLoading: false,
                loreText: loreResult,
                tier,
                similarityScores,
                backendOnline: true,
                error: null,
              }
            : null
        );

        addNarrative(`[${x}, ${z}] ${loreResult}`, blockType, tier);
      } catch (err: any) {
        if (err.name === "AbortError" && controller.signal.aborted) {
          return;
        }

        console.warn("Backend at http://localhost:8000/generate-lore unreachable:", err);
        const fallbackText = generateFallbackLore(blockType, x, z, adjacent);

        setContextCard((prev) =>
          prev
            ? {
                ...prev,
                isLoading: false,
                loreText: fallbackText,
                tier: "Offline Fallback Tier",
                backendOnline: false,
                error: "Backend offline at http://localhost:8000. Displaying spatial fallback lore.",
              }
            : null
        );

        addNarrative(`[${x}, ${z}] ${fallbackText}`, blockType, "Offline Fallback");
      }
    },
    [addNarrative]
  );

  const placeBlock = useCallback(
    async (x: number, z: number) => {
      const key = `${x},${z}`;
      const existing = blocks.get(key);

      if (existing && existing.type === selectedType) {
        setBlocks((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        addNarrative(`Demolished ${selectedType} at tile [${x}, ${z}].`, "System");
        closeContextCard();
        return;
      }

      const newBlock: VoxelBlockData = { id: key, x, z, type: selectedType };
      setBlocks((prev) => {
        const next = new Map(prev);
        next.set(key, newBlock);
        return next;
      });

      const adjacent = getAdjacentBlocks(x, z, blocks);
      await sendGenerateLoreRequest(selectedType, x, z, adjacent);
    },
    [selectedType, blocks, addNarrative, closeContextCard, sendGenerateLoreRequest]
  );

  const retryGenerateLore = useCallback(async () => {
    if (!contextCard) return;
    await sendGenerateLoreRequest(
      contextCard.blockType,
      contextCard.x,
      contextCard.z,
      contextCard.adjacentBlocks
    );
  }, [contextCard, sendGenerateLoreRequest]);

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
      if (contextCard && contextCard.x === x && contextCard.z === z) {
        closeContextCard();
      }
    },
    [addNarrative, contextCard, closeContextCard]
  );

  const clearGrid = useCallback(() => {
    setBlocks(new Map());
    addNarrative("Grid cleared. The realm is a blank slate.", "System");
    closeContextCard();
  }, [addNarrative, closeContextCard]);

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
        contextCard,
        closeContextCard,
        retryGenerateLore,
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
