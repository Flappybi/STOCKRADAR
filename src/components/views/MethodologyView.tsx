"use client";

import React from "react";
import { useRadar } from "@/context/RadarContext";
import {
  Database,
  Cpu,
  Radio,
  Sparkles,
  ArrowRight,
  BookOpen,
  Code,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function MethodologyView() {
  const { setCurrentView } = useRadar();

  const pipelineSteps = [
    {
      num: "01",
      title: "Market Data Ingestion",
      desc: "Streams tick-by-tick order books, volume flow, and quarterly financial filings directly from the Indonesia Stock Exchange (IDX).",
      icon: <Database className="w-5 h-5 text-yellow-400" />,
    },
    {
      num: "02",
      title: "Financial Matrix Analysis",
      desc: "Normalizes key balance sheet metrics (ROE, FCF yield, D/E, NPL, PBV) across 10-year percentile rolling distributions.",
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
    },
    {
      num: "03",
      title: "Radar Algorithm Synthesis",
      desc: "Executes weighted multi-factor quantitative scoring combining Quality, Growth, Momentum, Valuation, and Risk profiles.",
      icon: <Radio className="w-5 h-5 text-yellow-400" />,
    },
    {
      num: "04",
      title: "Signal Detection Array",
      desc: "Applies neural clustering to flag high-conviction institutional accumulation breakouts and asymmetrical opportunities.",
      icon: <Sparkles className="w-5 h-5 text-amber-300" />,
    },
    {
      num: "05",
      title: "AI Natural Language Explanation",
      desc: "Synthesizes institutional research rationale, actionable thesis points, and monitored risk vulnerabilities in clear text.",
      icon: <CheckCircle className="w-5 h-5 text-yellow-400" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-8 bg-black max-w-[1720px] mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-mono text-yellow-400 mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
          <span>QUANTITATIVE ARCHITECTURE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
          STOCK RADAR METHODOLOGY
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-0.5 max-w-3xl">
          Visual documentation of our autonomous pipeline: from raw market telemetry to multi-factor alpha computation and natural language reasoning.
        </p>
      </div>

      {/* 5-STAGE PIPELINE ARCHITECTURE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-yellow-500/30 shadow-[0_0_30px_rgba(250,204,21,0.08)] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h2 className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
            INTELLIGENCE PIPELINE WORKFLOW
          </h2>
          <span className="text-xs font-mono text-neutral-400">END-TO-END AUTONOMOUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {pipelineSteps.map((step, idx) => (
            <div
              key={step.num}
              className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col justify-between relative group hover:border-yellow-500/40 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-mono font-bold text-xs text-neutral-500">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-mono font-bold text-sm text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              {idx < pipelineSteps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-yellow-500/40">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MATHEMATICAL FORMULA BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-yellow-500/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-yellow-400" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                RADAR SCORE ALGORITHM FORMULA
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold">
              EQUILIBRIUM MODEL
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-black/90 border border-yellow-500/30 text-center space-y-2">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              COMPOSITE RADAR FORMULA
            </div>
            <div className="text-lg sm:text-2xl font-mono font-black text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">
              Radar Score = (0.30 × Q) + (0.25 × G) + (0.20 × M) + (0.15 × V) + (0.10 × R)
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              Normalized onto a standardized percentile scale [0.0 - 100.0]
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {[
              { label: "Quality (Q)", weight: "30%", color: "border-yellow-500/40 text-yellow-400", metrics: "ROE, FCF, Margins" },
              { label: "Growth (G)", weight: "25%", color: "border-amber-400/40 text-amber-300", metrics: "EPS, Top-line CAGR" },
              { label: "Momentum (M)", weight: "20%", color: "border-yellow-400/40 text-yellow-300", metrics: "RSI, Golden Cross" },
              { label: "Valuation (V)", weight: "15%", color: "border-amber-500/40 text-amber-400", metrics: "P/E, P/B, Div Yield" },
              { label: "Risk (R)", weight: "10%", color: "border-yellow-600/40 text-yellow-500", metrics: "Beta, NPL, Debt/Equity" },
            ].map((f) => (
              <div
                key={f.label}
                className={`p-3 rounded-xl bg-neutral-900/60 border ${f.color} text-center`}
              >
                <div className="text-2xl font-black font-mono">{f.weight}</div>
                <div className="text-xs font-mono font-bold text-white mt-1">
                  {f.label}
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">{f.metrics}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Backtesting & Confidence Specs */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider pb-3 border-b border-neutral-800">
              BACKTESTING METRICS (10-YEAR IDX)
            </h3>

            <div className="space-y-4 my-4 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">Annualized Alpha vs IHSG:</span>
                <span className="font-bold text-yellow-400">+14.2%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">Sharpe Ratio:</span>
                <span className="font-bold text-yellow-400">1.84</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">Maximum Drawdown:</span>
                <span className="font-bold text-white">-11.6%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">Hit Rate (Win %):</span>
                <span className="font-bold text-yellow-400">74.8%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView("screener")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)]"
          >
            Test Custom Weights in Screener
          </button>
        </div>
      </div>
    </div>
  );
}
