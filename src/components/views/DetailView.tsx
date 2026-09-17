"use client";

import React, { useState } from "react";
import HolographicCube3D from "@/components/3d/HolographicCube3D";
import ScoreGauge from "@/components/hud/ScoreGauge";
import RadarPentagonChart from "@/components/hud/RadarPentagonChart";
import { useRadar } from "@/context/RadarContext";
import { soundFx } from "@/utils/soundEngine";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GitCompare,
  ArrowLeft,
  Activity,
  Layers,
} from "lucide-react";

export default function DetailView() {
  const {
    selectedStock,
    stocks,
    setSelectedSymbol,
    setCurrentView,
    setComparisonSymbols,
  } = useRadar();

  const [insightVersion, setInsightVersion] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNewInsight = () => {
    soundFx.playScanBeep(1100);
    setIsGenerating(true);
    setTimeout(() => {
      setInsightVersion((v) => v + 1);
      setIsGenerating(false);
      soundFx.playSignalLock();
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-8 bg-black max-w-[1720px] mx-auto space-y-6">
      {/* Back Button & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-yellow-950">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-900 border border-yellow-500/30 text-xs font-mono text-yellow-200 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-mono text-white">
              {selectedStock.symbol}
            </h1>
            <span className="text-sm text-yellow-100/70 font-medium">
              {selectedStock.name}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
              {selectedStock.sector}
            </span>
          </div>
        </div>

        {/* Stock Switcher Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStock.symbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            {stocks.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} - {s.name} ({s.baseScore})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setComparisonSymbols([selectedStock.symbol, "BBRI"]);
              setCurrentView("comparison");
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/50 text-yellow-200 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(250,204,21,0.3)]"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare with Peer</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: 3D HOLOGRAPHIC FINANCIAL CUBE & MAIN RADAR SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Holographic Cube */}
        <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 border border-yellow-500/40 relative overflow-hidden flex flex-col justify-between shadow-[0_0_40px_rgba(250,204,21,0.2)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-yellow-400" />
                <span>SPATIAL FINANCIAL TELEMETRY</span>
              </div>
              <h2 className="text-lg font-bold font-mono text-white tracking-wide">
                HOLOGRAPHIC MULTI-FACTOR CORE
              </h2>
            </div>
            <div className="text-xs font-mono px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">
              {selectedStock.signalTag}
            </div>
          </div>

          <div className="w-full flex-1 min-h-[380px] flex items-center justify-center">
            <HolographicCube3D stock={selectedStock} />
          </div>

          {/* Floating Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-yellow-950">
            <div className="bg-black/90 p-2.5 rounded-xl border border-yellow-500/20 text-center">
              <div className="text-[10px] font-mono text-yellow-100/60 uppercase">
                Return On Equity (ROE)
              </div>
              <div className="text-lg font-black font-mono text-yellow-400">
                {selectedStock.financials.roe}
              </div>
            </div>
            <div className="bg-black/90 p-2.5 rounded-xl border border-yellow-500/20 text-center">
              <div className="text-[10px] font-mono text-yellow-100/60 uppercase">
                EPS Growth Velocity
              </div>
              <div className="text-lg font-black font-mono text-yellow-300">
                {selectedStock.financials.epsGrowth}
              </div>
            </div>
            <div className="bg-black/90 p-2.5 rounded-xl border border-yellow-500/20 text-center">
              <div className="text-[10px] font-mono text-yellow-100/60 uppercase">
                Volatility Profile
              </div>
              <div className="text-lg font-black font-mono text-amber-400">
                {selectedStock.financials.volatilityBeta}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Radar Score Breakdown & Pentagon */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-yellow-500/25 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
              <span className="text-xs font-mono font-bold text-yellow-100/80 uppercase tracking-wider">
                COMPOSITE RADAR EVALUATION
              </span>
              <span className="text-xs font-mono font-bold text-yellow-400">
                TOP 2% OF IDX
              </span>
            </div>

            <div className="my-2 flex justify-center">
              <ScoreGauge
                score={selectedStock.baseScore}
                label="RADAR SCORE"
                sublabel="5-FACTOR QUANTITATIVE EQUILIBRIUM"
                size={210}
              />
            </div>
          </div>

          <div className="my-2 flex justify-center">
            <RadarPentagonChart metrics={selectedStock.metrics} size={230} />
          </div>

          {/* Factor Breakdown Bars in Yellow */}
          <div className="space-y-2 pt-3 border-t border-yellow-950">
            {[
              { name: "Quality Moat", val: selectedStock.metrics.quality, col: "bg-yellow-400" },
              { name: "Earnings Growth", val: selectedStock.metrics.growth, col: "bg-yellow-300" },
              { name: "Price Momentum", val: selectedStock.metrics.momentum, col: "bg-amber-400" },
              { name: "Valuation Discount", val: selectedStock.metrics.value, col: "bg-amber-500" },
              { name: "Risk Resilience", val: selectedStock.metrics.risk, col: "bg-yellow-500" },
            ].map((metric) => (
              <div key={metric.name} className="flex items-center justify-between gap-3 text-xs font-mono">
                <span className="text-yellow-100/60 w-32 truncate">{metric.name}</span>
                <div className="flex-1 h-2 rounded-full bg-neutral-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${metric.col}`}
                    style={{ width: `${metric.val}%` }}
                  />
                </div>
                <span className="font-bold text-white w-8 text-right">{metric.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: AI RESEARCH ASSISTANT & PRICE CHART / FINANCIAL RATIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI RESEARCH INSIGHT CARD */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-yellow-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-white text-sm">
                  AI RESEARCH ASSISTANT
                </h3>
                <p className="text-[10px] font-mono text-yellow-400">
                  Autonomous Deep Dive Synthesis
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateNewInsight}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-900 border border-yellow-500/30 text-xs font-mono text-yellow-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Generate New Insight</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/90 border border-yellow-500/25 text-xs sm:text-sm text-yellow-100 leading-relaxed font-sans">
            <p className="italic">
              &ldquo;{selectedStock.symbol} receives a high Radar Score of {selectedStock.baseScore} because of strong profitability ({selectedStock.financials.roe} ROE), consistent earnings growth, and substantially lower financial risk compared with industry peers.&rdquo;
            </p>
            {insightVersion > 1 && (
              <p className="mt-2 text-yellow-300 text-xs">
                [Update Cycle #{insightVersion}]: Machine learning sentiment scan from IDX quarterly filings confirms strong institutional order book accumulation.
              </p>
            )}
          </div>

          <div>
            <div className="text-[11px] font-mono text-yellow-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-yellow-400" />
              <span>POSITIVE INVESTMENT PILLARS</span>
            </div>
            <div className="space-y-2">
              {selectedStock.aiAnalyst.whyPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-black/60 border border-yellow-500/20 text-xs text-yellow-100/90"
                >
                  <span className="text-yellow-400 font-bold font-mono">✓</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>KEY HEADWINDS & RISKS</span>
            </div>
            <div className="space-y-2">
              {selectedStock.aiAnalyst.riskPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200"
                >
                  <span className="text-amber-400 font-bold font-mono">⚠</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 30-Day Historical Trend & Institutional Ratios Table */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-yellow-500/25 shadow-xl space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                <h3 className="font-mono font-bold text-white text-sm uppercase tracking-wider">
                  30-DAY PRICE & ACCUMULATION HISTORY
                </h3>
              </div>
              <div className="text-xs font-mono font-bold text-yellow-300">
                IDR {selectedStock.price.toLocaleString()} ({selectedStock.changePercent}%)
              </div>
            </div>

            <div className="h-44 w-full mt-4 flex items-end justify-between gap-1.5 px-2 pb-2 bg-black/80 rounded-2xl border border-yellow-950">
              {selectedStock.priceHistory.map((item, idx) => {
                const minPrice = Math.min(...selectedStock.priceHistory.map((p) => p.price));
                const maxPrice = Math.max(...selectedStock.priceHistory.map((p) => p.price));
                const heightPercent = ((item.price - minPrice) / (maxPrice - minPrice || 1)) * 75 + 20;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-yellow-400 group-hover:from-yellow-300 group-hover:to-white transition-all relative"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-yellow-400 px-2 py-0.5 rounded text-[10px] font-mono text-yellow-300 whitespace-nowrap pointer-events-none z-10">
                        {item.price.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-yellow-100/40 group-hover:text-yellow-300">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-yellow-400 uppercase tracking-wider mb-2 font-bold">
              FUNDAMENTAL METRIC MATRIX
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">P/E RATIO</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {selectedStock.financials.per}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">P/B VALUE</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {selectedStock.financials.pbv}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">DIV YIELD</div>
                <div className="text-sm font-bold font-mono text-yellow-400 mt-0.5">
                  {selectedStock.financials.dividendYield}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">FCF YIELD</div>
                <div className="text-sm font-bold font-mono text-yellow-300 mt-0.5">
                  {selectedStock.financials.fcfYield}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">DEBT / EQUITY</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {selectedStock.financials.debtToEquity}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">MOAT SCORE</div>
                <div className="text-sm font-bold font-mono text-yellow-400 mt-0.5">
                  {selectedStock.aiAnalyst.moatScore} / 100
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">MARKET CAP</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  IDR {selectedStock.marketCapTrillionIDR} T
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/80 border border-yellow-500/20">
                <div className="text-[10px] font-mono text-yellow-100/50">TARGET UPSIDE</div>
                <div className="text-sm font-bold font-mono text-yellow-400 mt-0.5">
                  +{selectedStock.aiAnalyst.upsidePercent}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
