import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridLore — 3D Spatial Narrative Engine",
  description: "10x10 Isometric Voxel Canvas built with Next.js 14 and React Three Fiber.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 min-h-screen selection:bg-neon-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}

