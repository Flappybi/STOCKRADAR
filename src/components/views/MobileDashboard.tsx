"use client";

import React, { useState } from "react";
import RadarSphere3D from "@/components/3d/RadarSphere3D";
import ScoreGauge from "@/components/hud/ScoreGauge";
import { useRadar } from "@/context/RadarContext";
import {
  Sparkles,
  Activity,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

export default function MobileDashboard() {
  const {
    stocks,
    selectedStock,
    setSelectedSymbol,
    setCurrentView,
    watchlistSymbols,
    toggleWatchlist,
    setIsAskAiOpen,
  } = useRadar();

  const [filterSector, setFilterSector] = useState<string>("All");

  const filteredStocks =
    filterSector === "All"
      ? stocks
      : stocks.filter((s) => s.sector === filterSector);

  return (
    <div className="min-h-screen w-full bg-black text-yellow-100 flex justify-center pb-24">
      <div className="w-full max-w-md min-h-screen px-4 py-5 flex flex-col gap-4">
        {/* Top Header & Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              <span className="font-mono font-black text-black text-xs">SR</span>
            </div>
            <div>
              <div className="font-mono font-black text-sm tracking-wider text-white">
                STOCK<span className="text-yellow-400">RADAR</span>
              </div>
              <div className="text-[10px] font-mono text-yellow-400/80">
                Personal AI Stock Radar
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAskAiOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(250,204,21,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>AI Copilot</span>
          </button>
        </div>

        {/* Market Status Card */}
        <div className="glass-panel rounded-2xl p-4 border border-yellow-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-yellow-400/70 uppercase tracking-wider">
                MARKET STATUS
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold font-mono text-yellow-400">
                  Positive
                </span>
                <span className="text-sm font-mono font-semibold text-yellow-300">
                  +2.4% (IDX)
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-yellow-400/70 uppercase tracking-wider">
                SIGNALS ACTIVE
              </div>
              <div className="text-2xl font-black font-mono text-yellow-300">
                24
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-yellow-950 flex items-center justify-between text-[11px] font-mono text-yellow-100/60">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              Real-time High Frequency Scan
            </span>
            <span className="text-yellow-300">850 Equities</span>
          </div>
        </div>

        {/* Center: Compact 3D Radar Sphere + Circular Gauge */}
        <div className="glass-panel-glow rounded-3xl p-4 border border-yellow-500/40 relative flex flex-col items-center shadow-[0_0_35px_rgba(250,204,21,0.2)]">
          <div className="w-full h-44 relative -mb-12 opacity-85 pointer-events-auto">
            <RadarSphere3D particleCount={450} isCompact={true} />
          </div>

          <div className="relative z-10">
            <ScoreGauge
              score={selectedStock.baseScore}
              size={180}
              label={selectedStock.symbol}
              sublabel={selectedStock.signalTag}
            />
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="w-full grid grid-cols-5 gap-1 text-center mt-3 pt-3 border-t border-yellow-950">
            <div className="bg-black p-1.5 rounded-lg border border-yellow-500/20">
              <div className="text-[8px] font-mono text-yellow-100/60">QUAL</div>
              <div className="text-xs font-bold font-mono text-yellow-300">
                {selectedStock.metrics.quality}
              </div>
            </div>
            <div className="bg-black p-1.5 rounded-lg border border-yellow-500/20">
              <div className="text-[8px] font-mono text-yellow-100/60">GRO</div>
              <div className="text-xs font-bold font-mono text-yellow-300">
                {selectedStock.metrics.growth}
              </div>
            </div>
            <div className="bg-black p-1.5 rounded-lg border border-yellow-500/20">
              <div className="text-[8px] font-mono text-yellow-100/60">MOM</div>
              <div className="text-xs font-bold font-mono text-yellow-300">
                {selectedStock.metrics.momentum}
              </div>
            </div>
            <div className="bg-black p-1.5 rounded-lg border border-yellow-500/20">
              <div className="text-[8px] font-mono text-yellow-100/60">VAL</div>
              <div className="text-xs font-bold font-mono text-yellow-300">
                {selectedStock.metrics.value}
              </div>
            </div>
            <div className="bg-black p-1.5 rounded-lg border border-yellow-500/20">
              <div className="text-[8px] font-mono text-yellow-100/60">RISK</div>
              <div className="text-xs font-bold font-mono text-yellow-300">
                {selectedStock.metrics.risk}
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView("detail")}
            className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.4)]"
          >
            <span>Inspect 3D Financial Cube</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {["All", "Banking", "Technology", "Consumer Goods", "Energy & Mining", "Healthcare"].map(
            (sec) => (
              <button
                key={sec}
                onClick={() => setFilterSector(sec)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                  filterSector === sec
                    ? "bg-yellow-400 text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                    : "bg-black text-yellow-100/60 border border-yellow-500/20"
                }`}
              >
                {sec}
              </button>
            )
          )}
        </div>

        {/* Signal Feed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>RADAR SIGNAL FEED</span>
            </h3>
            <button
              onClick={() => setCurrentView("screener")}
              className="text-[11px] font-mono text-yellow-100/60 hover:text-yellow-300 flex items-center gap-1"
            >
              <span>Custom Screener</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredStocks.map((stock, idx) => {
              const isSelected = stock.symbol === selectedStock.symbol;
              const isWatchlisted = watchlistSymbols.includes(stock.symbol);

              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                  className={`glass-card rounded-2xl p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-yellow-400 bg-neutral-950 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                      : "border-yellow-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-black border border-yellow-500/30 flex items-center justify-center font-mono font-bold text-xs text-yellow-300">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-white">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 font-mono">
                            {stock.signalTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-yellow-100/60 truncate max-w-[180px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-yellow-300">
                        {stock.baseScore}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-semibold ${
                          stock.changePercent >= 0 ? "text-yellow-400" : "text-rose-400"
                        }`}
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent}%
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-yellow-950 text-xs text-yellow-100">
                      <p className="line-clamp-2 italic text-yellow-100/60 text-[11px]">
                        &ldquo;{stock.aiAnalyst.verdict}&rdquo;
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.symbol);
                          }}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                            isWatchlisted
                              ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/40"
                              : "bg-black text-yellow-100/60 border-yellow-500/20"
                          }`}
                        >
                          {isWatchlisted ? "★ Watchlisted" : "+ Add to Watchlist"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentView("detail");
                          }}
                          className="text-[11px] font-mono text-yellow-400 font-bold flex items-center gap-1"
                        >
                          <span>Full Analysis</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
