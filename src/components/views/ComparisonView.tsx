"use client";

import React, { useState } from "react";
import { useRadar } from "@/context/RadarContext";
import RadarPentagonChart from "@/components/hud/RadarPentagonChart";
import { soundFx } from "@/utils/soundEngine";
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function ComparisonView() {
  const { stocks, comparisonSymbols, setComparisonSymbols, setCurrentView, setSelectedSymbol } =
    useRadar();

  const stockA =
    stocks.find((s) => s.symbol === comparisonSymbols[0]) || stocks[0];
  const stockB =
    stocks.find((s) => s.symbol === comparisonSymbols[1]) || stocks[1] || stocks[0];

  const handleStockAChange = (sym: string) => {
    soundFx.playClick();
    setComparisonSymbols([sym, stockB.symbol]);
  };

  const handleStockBChange = (sym: string) => {
    soundFx.playClick();
    setComparisonSymbols([stockA.symbol, sym]);
  };

  const comparisonMetrics = [
    {
      label: "Quality Moat",
      valA: stockA.metrics.quality,
      valB: stockB.metrics.quality,
      winner: stockA.metrics.quality >= stockB.metrics.quality ? "A" : "B",
    },
    {
      label: "Earnings Growth",
      valA: stockA.metrics.growth,
      valB: stockB.metrics.growth,
      winner: stockA.metrics.growth >= stockB.metrics.growth ? "A" : "B",
    },
    {
      label: "Valuation Attractiveness",
      valA: stockA.metrics.value,
      valB: stockB.metrics.value,
      winner: stockA.metrics.value >= stockB.metrics.value ? "A" : "B",
    },
    {
      label: "Risk Resilience",
      valA: stockA.metrics.risk,
      valB: stockB.metrics.risk,
      winner: stockA.metrics.risk >= stockB.metrics.risk ? "A" : "B",
    },
    {
      label: "Price Momentum",
      valA: stockA.metrics.momentum,
      valB: stockB.metrics.momentum,
      winner: stockA.metrics.momentum >= stockB.metrics.momentum ? "A" : "B",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-8 bg-black max-w-[1720px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-mono text-yellow-300 mb-1.5">
            <GitCompare className="w-3.5 h-3.5 text-yellow-400" />
            <span>HOLOGRAPHIC DUAL CORES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
            STOCK COMPARISON ROOM
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-0.5">
            Side-by-side multi-factor institutional radar showdown and allocation synthesis.
          </p>
        </div>

        {/* Quick Pair Pickers */}
        <div className="flex items-center gap-3 bg-neutral-900/90 p-2 rounded-2xl border border-neutral-800">
          <select
            value={stockA.symbol}
            onChange={(e) => handleStockAChange(e.target.value)}
            className="bg-black border border-yellow-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-yellow-300 focus:outline-none"
          >
            {stocks.map((s) => (
              <option key={`a-${s.symbol}`} value={s.symbol}>
                {s.symbol} ({s.baseScore})
              </option>
            ))}
          </select>

          <span className="font-mono font-black text-xs text-yellow-500/70">VS</span>

          <select
            value={stockB.symbol}
            onChange={(e) => handleStockBChange(e.target.value)}
            className="bg-black border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none"
          >
            {stocks.map((s) => (
              <option key={`b-${s.symbol}`} value={s.symbol}>
                {s.symbol} ({s.baseScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DUAL HOLOGRAPHIC CORES & COMPARISON RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Holographic Core A */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-yellow-500/40 flex flex-col justify-between shadow-[0_0_30px_rgba(250,204,21,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-yellow-400 font-bold tracking-widest uppercase">
                INSTRUMENT [ALPHA]
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                {stockA.sector}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-4xl font-black font-mono text-white">
                {stockA.symbol}
              </h2>
              <p className="text-xs text-neutral-300 font-medium">
                {stockA.name}
              </p>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-black/80 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  RADAR SCORE
                </div>
                <div className="text-3xl font-black font-mono text-yellow-400">
                  {stockA.baseScore}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  PRICE (IDR)
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {stockA.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">ROE:</span>
              <span className="font-bold text-yellow-300">{stockA.financials.roe}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">P/E Multiple:</span>
              <span className="font-bold text-white">{stockA.financials.per}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Dividend Yield:</span>
              <span className="font-bold text-yellow-400">{stockA.financials.dividendYield}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-400">Target Upside:</span>
              <span className="font-bold text-yellow-400">+{stockA.aiAnalyst.upsidePercent}%</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedSymbol(stockA.symbol);
              setCurrentView("detail");
            }}
            className="mt-6 w-full py-2.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-bold transition-all text-center"
          >
            Inspect {stockA.symbol} Details
          </button>
        </div>

        {/* Center: Overlapping Dual Radar Chart */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-yellow-500/30 flex flex-col items-center justify-between shadow-[0_0_35px_rgba(250,204,21,0.15)]">
          <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              DUAL FACTOR OVERLAY
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-mono text-yellow-300 font-bold">{stockA.symbol}</span>
              <span className="text-neutral-500 text-xs font-mono">vs</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-mono text-amber-300 font-bold">{stockB.symbol}</span>
            </div>
          </div>

          {/* Pentagon Radar with both stocks */}
          <div className="my-auto py-3">
            <RadarPentagonChart
              metrics={stockA.metrics}
              compareMetrics={stockB.metrics}
              primaryLabel={stockA.symbol}
              compareLabel={stockB.symbol}
              size={260}
            />
          </div>

          <div className="w-full text-center text-[10px] font-mono text-neutral-400 pt-3 border-t border-neutral-800">
            Neon Yellow ({stockA.symbol}) vs Amber Gold ({stockB.symbol})
          </div>
        </div>

        {/* Holographic Core B */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-amber-500/40 flex flex-col justify-between shadow-[0_0_30px_rgba(245,158,11,0.12)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold tracking-widest uppercase">
                INSTRUMENT [BETA]
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {stockB.sector}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-4xl font-black font-mono text-white">
                {stockB.symbol}
              </h2>
              <p className="text-xs text-neutral-300 font-medium">
                {stockB.name}
              </p>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-black/80 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  RADAR SCORE
                </div>
                <div className="text-3xl font-black font-mono text-amber-400">
                  {stockB.baseScore}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  PRICE (IDR)
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {stockB.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">ROE:</span>
              <span className="font-bold text-amber-300">{stockB.financials.roe}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">P/E Multiple:</span>
              <span className="font-bold text-white">{stockB.financials.per}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Dividend Yield:</span>
              <span className="font-bold text-amber-400">{stockB.financials.dividendYield}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-neutral-400">Target Upside:</span>
              <span className="font-bold text-amber-400">+{stockB.aiAnalyst.upsidePercent}%</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedSymbol(stockB.symbol);
              setCurrentView("detail");
            }}
            className="mt-6 w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all text-center"
          >
            Inspect {stockB.symbol} Details
          </button>
        </div>
      </div>

      {/* METRIC DELTA BARS & AI COMPARISON CONCLUSION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Metric Comparison Delta Bars */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-neutral-800">
            HEAD-TO-HEAD FACTOR DELTAS
          </h3>

          <div className="space-y-4">
            {comparisonMetrics.map((m) => (
              <div key={m.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-yellow-400 font-bold">
                    {stockA.symbol} {m.valA}
                  </span>
                  <span className="text-neutral-300 font-medium">{m.label}</span>
                  <span className="text-amber-400 font-bold">
                    {m.valB} {stockB.symbol}
                  </span>
                </div>

                {/* Comparative Dual Bar */}
                <div className="flex items-center gap-2 h-3 rounded-full bg-black p-0.5 border border-neutral-800">
                  <div className="flex-1 flex justify-end">
                    <div
                      className="h-full rounded-l-full bg-yellow-400"
                      style={{ width: `${m.valA}%` }}
                    />
                  </div>
                  <div className="w-1 h-full bg-neutral-700" />
                  <div className="flex-1 flex justify-start">
                    <div
                      className="h-full rounded-r-full bg-amber-400"
                      style={{ width: `${m.valB}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Comparative Synthesis Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-yellow-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="font-mono font-bold text-white text-xs uppercase tracking-wider">
              AI ALLOCATION CONCLUSION
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-black/80 border border-neutral-800 text-xs text-neutral-200 leading-relaxed font-sans space-y-2">
            <p>
              <strong>Synthesis:</strong> While both {stockA.symbol} and {stockB.symbol} demonstrate premier institutional pedigree,{" "}
              <span className="text-yellow-300 font-bold font-mono">
                {stockA.baseScore >= stockB.baseScore ? stockA.symbol : stockB.symbol}
              </span>{" "}
              holds the statistical edge on risk-adjusted quality return.
            </p>
            <p className="text-neutral-400 text-[11px]">
              - Choose <strong>{stockA.symbol}</strong> for superior corporate moat, balance sheet conservatism, and lower downside volatility.
              <br />
              - Choose <strong>{stockB.symbol}</strong> for higher dividend yield extraction and valuation margin of safety.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300">Target Allocation:</span>
            <span className="text-yellow-300 font-bold">
              60% {stockA.symbol} / 40% {stockB.symbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
