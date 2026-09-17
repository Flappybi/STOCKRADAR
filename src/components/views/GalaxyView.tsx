"use client";

import React from "react";
import GalaxyCluster3D from "@/components/3d/GalaxyCluster3D";
import { useRadar } from "@/context/RadarContext";
import { Compass, Sparkles, Filter } from "lucide-react";

export default function GalaxyView() {
  const { stocks, selectedSymbol, setSelectedSymbol, setCurrentView } = useRadar();

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-6 bg-black max-w-[1800px] mx-auto flex flex-col justify-between">
      {/* 3D Celestial Galaxy Container */}
      <div className="flex-1 w-full min-h-[680px] relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.08)] border border-yellow-500/30">
        <GalaxyCluster3D />
      </div>

      {/* Quick Access Floating Sector Bar */}
      <div className="mt-4 glass-panel rounded-2xl p-3 border border-yellow-500/20 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-xs font-mono text-yellow-400 font-bold whitespace-nowrap">
          <Compass className="w-4 h-4 text-yellow-400" />
          <span>GALACTIC RADAR CLUSTERS:</span>
        </div>

        <div className="flex items-center gap-2">
          {stocks.slice(0, 8).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                setSelectedSymbol(stock.symbol);
                setCurrentView("detail");
              }}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-yellow-500/20 border border-neutral-800 hover:border-yellow-500/40 text-xs font-mono text-neutral-300 hover:text-yellow-300 transition-all flex items-center gap-1.5"
            >
              <span className="font-bold text-white">{stock.symbol}</span>
              <span className="text-[10px] text-yellow-400 font-bold">{stock.baseScore}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
