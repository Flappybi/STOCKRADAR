"use client";

import React, { useState } from "react";
import { useRadar } from "@/context/RadarContext";
import { Sparkles, X, Send, Bot, User, ArrowRight } from "lucide-react";
import { soundFx } from "@/utils/soundEngine";

interface Message {
  role: "user" | "ai";
  text: string;
  time: string;
}

export default function AskRadarModal() {
  const { isAskAiOpen, setIsAskAiOpen, selectedStock, stocks } = useRadar();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `Greetings, Analyst. I am RADAR AI, your high-frequency quantitative market copilot. Currently tracking ${stocks.length} tier-1 Indonesian equities with 24 active high-value signals. How may I assist your portfolio strategy today?`,
      time: "19:15:00",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!isAskAiOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    soundFx.playClick();
    const userMsg: Message = {
      role: "user",
      text: q,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsThinking(true);

    setTimeout(() => {
      soundFx.playScanBeep(1200);
      let reply = "";
      const lower = q.toLowerCase();

      if (lower.includes("bbca") || lower.includes("ranked #1") || lower.includes("rank 1")) {
        reply = `BBCA holds the #1 Radar Ranking (Score: 87.5/100) due to its exceptional Quality metric (90/100) and lowest systemic credit risk (Risk Safety 91/100). Its 21.4% ROE, 81.2% low-cost CASA deposit foundation, and negligible 0.6% NPL ratio provide an unassailable financial fortress that justifies its premium 4.8x PBV multiple.`;
      } else if (lower.includes("compare") || lower.includes("bbri")) {
        reply = `Comparative Analysis: BBCA (87.5) vs BBRI (83.1). BBCA leads in Risk Safety (91 vs 72) and Quality Moat (90 vs 83), making it the premier capital preservation choice. Conversely, BBRI offers superior Dividend Yield (5.4% vs 2.8%) and Value Score (76 vs 65) driven by high-yielding grassroots microfinance (Kupedes/PNM). Recommendation: BBCA for core defensiveness; BBRI for aggressive income.`;
      } else if (lower.includes("value") || lower.includes("cheap")) {
        const topValue = [...stocks].sort((a, b) => b.metrics.value - a.metrics.value)[0];
        reply = `Top Value Opportunity Detected: ${topValue.symbol} (${topValue.name}) with a Value Score of ${topValue.metrics.value}/100. It is trading at a P/E of ${topValue.financials.per} and PBV of ${topValue.financials.pbv} with a stellar dividend yield of ${topValue.financials.dividendYield}.`;
      } else if (lower.includes("methodology") || lower.includes("formula")) {
        reply = `The Stock Radar Algorithm calculates composite alpha using normalized multi-factor quant vectors: Radar Score = (30% × Quality) + (25% × Growth) + (20% × Momentum) + (15% × Valuation) + (10% × Risk Safety). All inputs are benchmarked against 10-year rolling percentiles across the IDX universe.`;
      } else {
        reply = `Telemetry Insight for ${selectedStock.symbol}: Scoring ${selectedStock.baseScore}/100 in the ${selectedStock.sector} sector. Institutional flow momentum is currently ${selectedStock.status === "Strong" ? "robust (+Bullish Accumulation)" : "neutral"}. The 12-month fair value consensus indicates an upside of +${selectedStock.aiAnalyst.upsidePercent}% to IDR ${selectedStock.aiAnalyst.targetPriceIDR.toLocaleString()}.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: reply,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setIsThinking(false);
    }, 650);
  };

  const samplePrompts = [
    "Why is BBCA ranked #1?",
    "Compare BBCA vs BBRI for dividends",
    "Which stock has the highest value score?",
    "Explain the Radar algorithm formula",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-black border border-yellow-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(250,204,21,0.3)] flex flex-col h-[600px] overflow-hidden">
        {/* Holographic Header */}
        <div className="flex items-center justify-between pb-4 border-b border-yellow-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              <Sparkles className="w-5 h-5 text-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-white text-base">
                  RADAR AI ASSISTANT
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/35 text-[10px] font-mono">
                  ONLINE // LATENCY: 12ms
                </span>
              </div>
              <p className="text-xs text-yellow-100/60 font-mono">
                Real-time Indonesian Market Intelligence Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAskAiOpen(false)}
            className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-yellow-500/30 text-yellow-400/70 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                  m.role === "user"
                    ? "bg-yellow-400 text-black font-bold"
                    : "bg-yellow-400/20 text-yellow-400 border border-yellow-400/35"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4 text-black" /> : <Bot className="w-4 h-4 text-yellow-400" />}
              </div>
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed font-sans ${
                  m.role === "user"
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-neutral-950 border border-yellow-500/20 text-yellow-100 shadow-md"
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] font-mono mt-1 ${
                    m.role === "user" ? "text-neutral-800 text-right font-medium" : "text-yellow-100/40"
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 border border-yellow-400/35 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-neutral-950 border border-yellow-500/30 rounded-2xl px-4 py-2 text-xs text-yellow-400 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                Synthesizing multi-factor neural thesis...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full bg-neutral-950 hover:bg-neutral-900 border border-yellow-500/20 hover:border-yellow-400 text-[11px] font-mono text-yellow-100/70 hover:text-yellow-300 transition-all flex items-center gap-1"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-2.5 h-2.5 text-yellow-400" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-yellow-950 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about Indonesian stocks, radar scores, or macro drivers..."
            className="flex-1 bg-neutral-950 border border-yellow-500/30 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-yellow-100/30 focus:outline-none focus:ring-1 focus:ring-yellow-400 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || isThinking}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
