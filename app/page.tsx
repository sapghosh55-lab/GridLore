"use client";

import dynamic from "next/dynamic";
import { GridProvider } from "@/context/GridContext";
import { Header } from "@/components/ui/Header";
import { Toolbar } from "@/components/ui/Toolbar";
import { NarrativePanel } from "@/components/ui/NarrativePanel";

// Dynamic import with SSR disabled to guarantee smooth Three.js WebGL canvas initialization
const GridScene = dynamic(
  () => import("@/components/canvas/GridScene").then((mod) => mod.GridScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-950 text-gray-400 gap-3">
        <div className="w-10 h-10 border-2 border-neon-purple border-t-neon-cyan rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase text-neon-cyan">
          Initializing 3D Spatial Grid...
        </span>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <GridProvider>
      <main className="w-screen h-screen relative bg-dark-950 overflow-hidden">
        <Header />
        <GridScene />
        <NarrativePanel />
        <Toolbar />
      </main>
    </GridProvider>
  );
}

