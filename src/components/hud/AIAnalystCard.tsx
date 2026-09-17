"use client";

import React, { useState, useEffect } from "react";
import { StockData } from "@/types/stock";
import { Sparkles, CheckCircle2, AlertTriangle, Cpu, RefreshCw, ArrowUpRight } from "lucide-react";
import { soundFx } from "@/utils/soundEngine";
import { useRadar } from "@/context/RadarContext";

interface AIAnalystCardProps {
  stock: StockData;
}

export default function AIAnalystCard({ stock }: AIAnalystCardProps) {
  const { setCurrentView } = useRadar();
  const [displayedVerdict, setDisplayedVerdict] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("baseline");

  useEffect(() => {
    let currentIdx = 0;
    const fullText = stock.aiAnalyst.verdict;
    setDisplayedVerdict("");
    setIsTyping(true);

    const timer = setInterval(() => {
      if (currentIdx < fullText.length) {
        setDisplayedVerdict(fullText.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [stock, selectedScenario]);

  const handleRegenerateInsight = () => {
    soundFx.playScanBeep(1040);
    const scenarios = ["baseline", "stress_test", "macro_rate_cut"];
    const nextScenario =
      scenarios[(scenarios.indexOf(selectedScenario) + 1) % scenarios.length];
    setSelectedScenario(nextScenario);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-yellow-500/30 relative overflow-hidden flex flex-col justify-between h-full shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
      <div>
        {/* Top Header in Yellow/Black */}
        <div className="flex items-center justify-between pb-3 border-b border-yellow-950">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              <Cpu className="w-4 h-4 text-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  AI MARKET ANALYST
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
              </div>
              <div className="text-[10px] font-mono text-yellow-400">
                NEURAL REASONING CORE v4.1
              </div>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-yellow-400/15 border border-yellow-400/35 text-[10px] font-mono text-yellow-300">
            SIGNAL: <strong className="text-white">{stock.signalTag}</strong>
          </div>
        </div>

        {/* Stock Signal Target Banner */}
        <div className="my-4 p-3 rounded-xl bg-black/80 border border-yellow-500/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-yellow-400/70 uppercase">
              TARGET INSTRUMENT
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-white">
                {stock.symbol}
              </span>
              <span className="text-xs text-yellow-100/80 truncate max-w-[120px]">
                {stock.name}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-yellow-400/70 uppercase">
              12M FAIR VALUE TARGET
            </div>
            <div className="text-sm font-bold font-mono text-yellow-300 flex items-center justify-end gap-1">
              IDR {stock.aiAnalyst.targetPriceIDR.toLocaleString()}
              <span className="text-[10px] text-yellow-400/80">
                (+{stock.aiAnalyst.upsidePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* AI Synthesis with Typewriter Effect */}
        <div className="my-3">
          <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 font-bold">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            SYNTHESIS RATIONALE
          </div>
          <div className="p-3.5 rounded-xl bg-black/90 border border-yellow-500/25 text-xs text-yellow-100 leading-relaxed font-sans min-h-[90px] relative">
            <p>
              &ldquo;{displayedVerdict}&rdquo;
              {isTyping && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-yellow-400 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </div>

        {/* Bullish Drivers */}
        <div className="mt-4">
          <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
            BULLISH DRIVERS & MOAT PILLARS
          </div>
          <div className="space-y-1.5">
            {stock.aiAnalyst.whyPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-yellow-100/90 p-2 rounded-lg bg-black/60 border border-yellow-500/20"
              >
                <span className="text-yellow-400 font-bold font-mono text-xs mt-0.5">
                  ✓
                </span>
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Vulnerabilities */}
        <div className="mt-3">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            MONITORED RISK VULNERABILITIES
          </div>
          <div className="space-y-1.5">
            {stock.aiAnalyst.riskPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-amber-200 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <span className="text-amber-400 font-bold font-mono text-xs mt-0.5">
                  ⚠
                </span>
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-5 pt-3 border-t border-yellow-950 flex items-center gap-2">
        <button
          onClick={handleRegenerateInsight}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-900 border border-yellow-500/30 text-yellow-200 text-xs font-mono font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isTyping ? "animate-spin" : ""}`} />
          <span>Regenerate Insight</span>
        </button>

        <button
          onClick={() => setCurrentView("detail")}
          className="flex items-center gap-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-mono font-black transition-all shadow-[0_0_15px_rgba(250,204,21,0.5)]"
        >
          <span>Deep Dive</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
