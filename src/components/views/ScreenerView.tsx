"use client";

import React, { useState } from "react";
import { useRadar } from "@/context/RadarContext";
import { STRATEGY_PRESETS } from "@/data/stocksData";
import { soundFx } from "@/utils/soundEngine";
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ScreenerView() {
  const {
    stocks,
    strategyWeights,
    setStrategyWeights,
    activePreset,
    applyPreset,
    setSelectedSymbol,
    setCurrentView,
  } = useRadar();

  const [localWeights, setLocalWeights] = useState(strategyWeights);
  const [isScanning, setIsScanning] = useState(false);

  const handleSliderChange = (key: keyof typeof localWeights, val: number) => {
    soundFx.playClick();
    setLocalWeights((prev) => ({
      ...prev,
      [key]: val / 100,
    }));
  };

  const handleRunRadar = () => {
    soundFx.playRadarSweep();
    setIsScanning(true);

    setTimeout(() => {
      setStrategyWeights(localWeights);
      setIsScanning(false);
      soundFx.playSignalLock();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#facc15", "#fde047", "#f59e0b", "#ffffff"],
        });
      } catch {
        // ignore
      }
    }, 450);
  };

  const totalWeightPercent = Math.round(
    (localWeights.quality +
      localWeights.growth +
      localWeights.momentum +
      localWeights.value +
      localWeights.risk) *
      100
  );

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-8 bg-black max-w-[1720px] mx-auto">
      {/* Top Header */}
      <div className="mb-6 pb-4 border-b border-yellow-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-xs font-mono text-yellow-300 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            <span>QUANTITATIVE FACTOR ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
            STOCK RADAR SCREENER
          </h1>
          <p className="text-xs sm:text-sm text-yellow-100/60 font-sans mt-0.5">
            Engineer custom institutional factor allocations and recalculate real-time Indonesian equity rankings.
          </p>
        </div>

        <button
          onClick={handleRunRadar}
          disabled={isScanning}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all transform hover:scale-105 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 text-black ${isScanning ? "animate-spin" : ""}`} />
          <span>RUN RADAR ALGORITHM</span>
        </button>
      </div>

      {/* TWO COLUMN SCREENER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: STRATEGY CONTROLS & WEIGHT SLIDERS */}
        <div className="lg:col-span-5 space-y-5">
          {/* Investment Presets */}
          <div className="glass-panel rounded-2xl p-5 border border-yellow-500/25 shadow-lg">
            <div className="text-xs font-mono text-yellow-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Investment Presets</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STRATEGY_PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      applyPreset(preset.id);
                      setLocalWeights(preset.weights);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                        : "bg-black border-yellow-500/20 hover:border-yellow-500/40 hover:bg-neutral-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">
                        {preset.name}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                    <div className="text-[10px] text-yellow-100/60 mt-1 line-clamp-1">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Weight Sliders */}
          <div className="glass-panel-glow rounded-2xl p-5 border border-yellow-500/35 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CUSTOM FACTOR WEIGHTS
                </h3>
                <div className="text-[10px] font-mono text-yellow-100/60">
                  Total Weight: {totalWeightPercent}%
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  applyPreset("balanced");
                  setLocalWeights({ quality: 0.3, growth: 0.25, momentum: 0.2, value: 0.15, risk: 0.1 });
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-yellow-100/60 hover:text-yellow-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Factor Sliders in Yellow Accents */}
            {[
              { key: "quality", label: "Quality Factor", desc: "ROE, Margins, Balance Sheet Moat", val: localWeights.quality },
              { key: "growth", label: "Growth Velocity", desc: "EPS Growth, Revenue Compound", val: localWeights.growth },
              { key: "momentum", label: "Market Momentum", desc: "RSI, Moving Avg, Institutional Flow", val: localWeights.momentum },
              { key: "value", label: "Valuation Discount", desc: "P/E, P/B, Free Cash Flow Yield", val: localWeights.value },
              { key: "risk", label: "Risk Safety Profile", desc: "Low Beta, Debt/Equity, Low NPL", val: localWeights.risk },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">{f.label}</span>
                  <span className="px-2 py-0.5 rounded bg-black border border-yellow-500/30 text-yellow-300 font-black">
                    {Math.round(f.val * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={Math.round(f.val * 100)}
                  onChange={(e) =>
                    handleSliderChange(
                      f.key as keyof typeof localWeights,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 rounded-lg bg-neutral-950 border border-yellow-500/30 appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="text-[10px] text-yellow-100/50 font-sans">{f.desc}</div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={handleRunRadar}
                disabled={isScanning}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>APPLY & RE-CALCULATE RADAR</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME RANKING RESULTS */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-yellow-500/20 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-yellow-950 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                RADAR RANKINGS // LIVE ALPHA OUTPUT
              </h2>
            </div>
            <div className="text-xs font-mono text-yellow-100/60">
              {stocks.length} Companies Evaluated
            </div>
          </div>

          <div className="space-y-3">
            {stocks.map((stock, rankIdx) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  setCurrentView("detail");
                }}
                className="group p-4 rounded-xl bg-black border border-yellow-500/20 hover:border-yellow-400 hover:bg-neutral-950 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border ${
                      rankIdx === 0
                        ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                        : rankIdx === 1
                        ? "bg-neutral-800 text-yellow-200 border-yellow-500/40"
                        : rankIdx === 2
                        ? "bg-neutral-900 text-yellow-300 border-yellow-500/30"
                        : "bg-black text-yellow-100/40 border-yellow-900"
                    }`}
                  >
                    #{rankIdx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-white group-hover:text-yellow-300 transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                        {stock.signalTag}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-100/60 font-medium truncate max-w-[220px]">
                      {stock.name} • {stock.sector}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="hidden md:flex items-center gap-2 text-[10px] font-mono">
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-yellow-500/20 text-yellow-100/80">
                    Q: <strong className="text-yellow-400">{stock.metrics.quality}</strong>
                  </div>
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-yellow-500/20 text-yellow-100/80">
                    G: <strong className="text-yellow-400">{stock.metrics.growth}</strong>
                  </div>
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-yellow-500/20 text-yellow-100/80">
                    M: <strong className="text-yellow-400">{stock.metrics.momentum}</strong>
                  </div>
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-yellow-500/20 text-yellow-100/80">
                    V: <strong className="text-yellow-400">{stock.metrics.value}</strong>
                  </div>
                  <div className="bg-neutral-950 px-2 py-1 rounded border border-yellow-500/20 text-yellow-100/80">
                    R: <strong className="text-yellow-400">{stock.metrics.risk}</strong>
                  </div>
                </div>

                {/* Main Radar Score & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-yellow-950">
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-yellow-100/60 uppercase">
                      RADAR SCORE
                    </div>
                    <div className="text-2xl font-black font-mono text-yellow-300">
                      {stock.baseScore}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-neutral-900 group-hover:bg-yellow-400 group-hover:text-black flex items-center justify-center text-yellow-400 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
