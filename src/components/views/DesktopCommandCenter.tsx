"use client";

import React from "react";
import MarketGlobe3D from "@/components/3d/MarketGlobe3D";
import ScoreGauge from "@/components/hud/ScoreGauge";
import RadarPentagonChart from "@/components/hud/RadarPentagonChart";
import AIAnalystCard from "@/components/hud/AIAnalystCard";
import { useRadar } from "@/context/RadarContext";
import { Globe, TrendingUp, Sliders, Layers, GitCompare } from "lucide-react";

export default function DesktopCommandCenter() {
  const {
    stocks,
    selectedStock,
    setSelectedSymbol,
    setCurrentView,
    setComparisonSymbols,
  } = useRadar();

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-6 bg-black flex flex-col justify-between max-w-[1800px] mx-auto">
      {/* Top Telemetry Ticker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-yellow-950">
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-yellow-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span>COMMAND CENTER // ACTIVE TARGET:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black font-mono text-white">
              {selectedStock.symbol}
            </span>
            <span className="text-xs text-yellow-100/80">
              {selectedStock.name}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-400/20 text-yellow-300 border border-yellow-400/35">
              {selectedStock.sector}
            </span>
          </div>
        </div>

        {/* Quick View Switcher Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView("detail")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-yellow-500/30 text-xs font-mono text-yellow-200 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hologram Cube (Detail)</span>
          </button>
          <button
            onClick={() => {
              setComparisonSymbols([selectedStock.symbol, "BBRI"]);
              setCurrentView("comparison");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-yellow-500/30 text-xs font-mono text-yellow-200 transition-all"
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
            <span>Compare Head-to-Head</span>
          </button>
          <button
            onClick={() => setCurrentView("screener")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-yellow-500/30 text-xs font-mono text-yellow-200 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            <span>Strategy Screener</span>
          </button>
        </div>
      </div>

      {/* 3-PANEL COMMAND CENTER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
        {/* LEFT PANEL: 3D MARKET UNIVERSE (Globe) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col justify-between border border-yellow-500/25 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: "20s" }} />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  3D MARKET UNIVERSE
                </h3>
                <div className="text-[10px] font-mono text-yellow-100/50">
                  Interactive IDX Spatial Globe
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-yellow-100/50">
              Drag to rotate • Wheel to zoom
            </div>
          </div>

          {/* Globe Canvas Area */}
          <div className="flex-1 w-full min-h-[380px] relative rounded-xl overflow-hidden bg-black border border-yellow-500/20">
            <MarketGlobe3D />
          </div>

          <div className="mt-3 pt-2 border-t border-yellow-950 flex items-center justify-between text-[11px] font-mono">
            <span className="text-yellow-100/60">Clusters Tracked:</span>
            <span className="text-yellow-300">Banking • Energy • Consumer • Tech • Pharma</span>
          </div>
        </div>

        {/* CENTER PANEL: MAIN RADAR SCORE & MULTI-AXIS PENTAGON */}
        <div className="lg:col-span-4 glass-panel-glow rounded-2xl p-5 flex flex-col justify-between border border-yellow-500/40 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  MAIN RADAR SCORE
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-yellow-100/60">Market Price:</span>
                <span className="font-bold text-white">
                  IDR {selectedStock.price.toLocaleString()}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    selectedStock.changePercent >= 0 ? "text-yellow-300" : "text-rose-400"
                  }`}
                >
                  ({selectedStock.changePercent >= 0 ? "+" : ""}
                  {selectedStock.changePercent}%)
                </span>
              </div>
            </div>

            {/* Large Holographic Score Circle */}
            <div className="my-2 flex justify-center">
              <ScoreGauge
                score={selectedStock.baseScore}
                label="STOCK RADAR SCORE"
                sublabel={`CONFIDENCE: 96.4% • ${selectedStock.signalTag}`}
                size={230}
              />
            </div>
          </div>

          {/* Pentagon Radar Chart: Quality, Growth, Momentum, Value, Risk */}
          <div className="my-1 flex flex-col items-center">
            <RadarPentagonChart metrics={selectedStock.metrics} size={250} />
          </div>

          {/* Quick Metrics Bar Around Circle */}
          <div className="grid grid-cols-5 gap-1.5 text-center pt-3 border-t border-yellow-950">
            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20">
              <div className="text-[9px] font-mono text-yellow-100/60">QUALITY</div>
              <div className="text-sm font-black font-mono text-yellow-300">
                {selectedStock.metrics.quality}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20">
              <div className="text-[9px] font-mono text-yellow-100/60">GROWTH</div>
              <div className="text-sm font-black font-mono text-yellow-300">
                {selectedStock.metrics.growth}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20">
              <div className="text-[9px] font-mono text-yellow-100/60">MOMENTUM</div>
              <div className="text-sm font-black font-mono text-yellow-300">
                {selectedStock.metrics.momentum}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20">
              <div className="text-[9px] font-mono text-yellow-100/60">VALUE</div>
              <div className="text-sm font-black font-mono text-yellow-300">
                {selectedStock.metrics.value}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20">
              <div className="text-[9px] font-mono text-yellow-100/60">RISK</div>
              <div className="text-sm font-black font-mono text-yellow-300">
                {selectedStock.metrics.risk}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI MARKET ANALYST */}
        <div className="lg:col-span-4 flex flex-col">
          <AIAnalystCard stock={selectedStock} />
        </div>
      </div>

      {/* BOTTOM TICKER / STOCK RADAR SWITCHER */}
      <div className="mt-5 glass-panel rounded-2xl p-3 border border-yellow-500/25 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider font-bold whitespace-nowrap px-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
          <span>RADAR FEED</span>
        </div>

        <div className="flex items-center gap-2">
          {stocks.map((stock) => {
            const isSelected = stock.symbol === selectedStock.symbol;
            return (
              <button
                key={stock.symbol}
                onClick={() => setSelectedSymbol(stock.symbol)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                  isSelected
                    ? "bg-yellow-400/20 border-yellow-400 text-white shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                    : "bg-black border-yellow-500/20 text-yellow-100/70 hover:border-yellow-500/50 hover:text-white"
                }`}
              >
                <span className="font-bold">{stock.symbol}</span>
                <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-[10px] text-yellow-300">
                  {stock.baseScore}
                </span>
                <span
                  className={`text-[10px] ${
                    stock.changePercent >= 0 ? "text-yellow-400" : "text-rose-400"
                  }`}
                >
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
