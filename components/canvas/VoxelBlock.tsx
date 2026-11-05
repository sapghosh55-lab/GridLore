"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BlockType } from "@/context/GridContext";

interface VoxelBlockProps {
  x: number;
  z: number;
  type: BlockType;
}

export const VoxelBlock: React.FC<VoxelBlockProps> = ({ x, z, type }) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);

  // Smooth pop-in spawn animation
  useFrame((_, delta) => {
    if (scaleRef.current < 1) {
      scaleRef.current = Math.min(1, scaleRef.current + delta * 6);
      if (groupRef.current) {
        const s = THREE.MathUtils.lerp(0.1, 1, scaleRef.current);
        groupRef.current.scale.set(s, s, s);
      }
    }
  });

  if (type === "Tavern") {
    return (
      <group ref={groupRef} position={[x, 0.5, z]} scale={[0.1, 0.1, 0.1]}>
        {/* Main Brown Wooden Structure */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.92, 0.92, 0.92]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Sloped Timber Roof Peak */}
        <mesh castShadow position={[0, 0.58, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.72, 0.45, 4]} />
          <meshStandardMaterial color="#5c2e0b" roughness={0.8} />
        </mesh>
        {/* Warm Glowing Entrance Lantern */}
        <mesh position={[0.47, 0.05, 0.15]}>
          <boxGeometry args={[0.06, 0.18, 0.18]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      </group>
    );
  }

  if (type === "Mountain") {
    return (
      <group ref={groupRef} position={[x, 0.5, z]} scale={[0.1, 0.1, 0.1]}>
        {/* Rocky Stone Base Cube (Gray) */}
        <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[0.94, 0.85, 0.94]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} metalness={0.15} />
        </mesh>
        {/* Jagged Ridge Peak */}
        <mesh castShadow position={[0, 0.48, 0]} rotation={[0, 0.3, 0]}>
          <coneGeometry args={[0.55, 0.65, 5]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Snow Peak */}
        <mesh position={[0, 0.72, 0]} rotation={[0, 0.3, 0]}>
          <coneGeometry args={[0.22, 0.22, 5]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  // Forest: Distinct Green Block
  return (
    <group ref={groupRef} position={[x, 0.5, z]} scale={[0.1, 0.1, 0.1]}>
      {/* Base Cube Earth */}
      <mesh castShadow receiveShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[0.92, 0.45, 0.92]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.9} />
      </mesh>
      {/* Lower Pine Canopy Layer */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <coneGeometry args={[0.58, 0.5, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
      {/* Upper Vibrant Foliage Canopy */}
      <mesh position={[0, 0.48, 0]}>
        <coneGeometry args={[0.42, 0.45, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.5} />
      </mesh>
    </group>
  );
};

