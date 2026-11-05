"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGrid, BlockType } from "@/context/GridContext";
import { VoxelBlock } from "./VoxelBlock";

const COLOR_MAP: Record<BlockType, string> = {
  Tavern: "#8B4513",
  Mountain: "#64748b",
  Forest: "#10b981",
};

const InteractiveGrid: React.FC = () => {
  const { gridSize, blocks, placeBlock, selectedType, hoveredCoord, setHoveredCoord } = useGrid();
  const offset = (gridSize - 1) / 2;

  // 10x10 tile coordinates
  const tiles = useMemo(() => {
    const list: { x: number; z: number }[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        list.push({ x, z });
      }
    }
    return list;
  }, [gridSize]);

  return (
    <group position={[-offset, 0, -offset]}>
      {/* 10x10 Clickable Floor Tiles */}
      {tiles.map(({ x, z }) => {
        const isHovered = hoveredCoord?.x === x && hoveredCoord?.z === z;
        const key = `${x},${z}`;
        const hasBlock = blocks.has(key);
        const isAlternate = (x + z) % 2 === 0;

        return (
          <mesh
            key={key}
            position={[x, 0, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredCoord({ x, z });
            }}
            onPointerOut={() => {
              setHoveredCoord(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              placeBlock(x, z);
            }}
          >
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial
              color={
                isHovered
                  ? "#2e3252"
                  : isAlternate
                  ? "#1b1d2e"
                  : "#22253b"
              }
              roughness={0.8}
            />
          </mesh>
        );
      })}

      {/* Grid Lines Helper */}
      <gridHelper
        args={[gridSize, gridSize, "#8a2be2", "#323652"]}
        position={[offset, 0.005, offset]}
      />

      {/* Placed Voxel Blocks */}
      {Array.from(blocks.values()).map((block) => (
        <VoxelBlock key={block.id} x={block.x} z={block.z} type={block.type} />
      ))}

      {/* Interactive Hover Hologram Preview */}
      {hoveredCoord && (
        <group position={[hoveredCoord.x, 0, hoveredCoord.z]}>
          {/* Tile highlight cursor */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.98, 0.98]} />
            <meshBasicMaterial
              color={selectedType === "Tavern" ? "#ff8800" : selectedType === "Forest" ? "#00ffff" : "#8a2be2"}
              transparent
              opacity={0.35}
            />
          </mesh>
          {/* Wireframe box showing upcoming placement */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.92, 0.92, 0.92]} />
            <meshBasicMaterial
              color={COLOR_MAP[selectedType]}
              wireframe
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const GridScene: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [12, 14, 12],
          fov: 38,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#141522" }} // Clear neutral studio slate (NO fog, NO pitch-black)
      >
        {/* Natural Ambient Lighting */}
        <ambientLight intensity={0.9} color="#f1f5f9" />
        <hemisphereLight
          args={["#cbd5e1", "#1e2133", 0.75]}
          position={[0, 50, 0]}
        />
        {/* Warm Sunlight for natural depth and shadows */}
        <directionalLight
          position={[15, 24, 12]}
          intensity={1.3}
          castShadow
          color="#fffaf0"
        />
        {/* Subtle Cyberpunk Fill Light */}
        <directionalLight
          position={[-12, 10, -10]}
          intensity={0.4}
          color="#8a2be2"
        />

        {/* 10x10 Voxel Grid */}
        <InteractiveGrid />

        {/* OrbitControls configured for isometric view without clipping or dipping */}
        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={6}
          maxDistance={35}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

