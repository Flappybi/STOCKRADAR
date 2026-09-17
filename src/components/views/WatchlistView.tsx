"use client";

import React from "react";
import { useRadar } from "@/context/RadarContext";
import { soundFx } from "@/utils/soundEngine";
import {
  Eye,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Sparkles,
  Activity,
} from "lucide-react";

export default function WatchlistView() {
  const {
    stocks,
    watchlistSymbols,
    toggleWatchlist,
    setSelectedSymbol,
    setCurrentView,
  } = useRadar();

  const watchedStocks = stocks.filter((s) => watchlistSymbols.includes(s.symbol));
  const unwatchedStocks = stocks.filter((s) => !watchlistSymbols.includes(s.symbol));

  return (
    <div className="min-h-[calc(100vh-65px)] w-full p-4 lg:p-8 bg-black max-w-[1720px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-mono text-yellow-400 mb-1.5">
            <Eye className="w-3.5 h-3.5 text-yellow-400" />
            <span>REAL-TIME PORTFOLIO RADAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
            PERSONAL WATCHLIST TELEMETRY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-0.5">
            Live order-book tracking, neural score drift indicators, and automated high-conviction alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span className="text-neutral-300">Live Pulse:</span>
          <span className="text-yellow-400 font-bold">{watchedStocks.length} Tracked</span>
        </div>
      </div>

      {/* WATCHED STOCKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {watchedStocks.map((stock) => (
          <div
            key={stock.symbol}
            className="glass-panel-glow rounded-3xl p-5 border border-yellow-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-yellow-400 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono text-white group-hover:text-yellow-300 transition-colors">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">
                      {stock.signalTag}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 font-medium truncate max-w-[200px] mt-0.5">
                    {stock.name}
                  </div>
                </div>

                <button
                  onClick={() => toggleWatchlist(stock.symbol)}
                  title="Remove from Watchlist"
                  className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Score Banner */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-2xl bg-black/80 border border-neutral-800">
                <div>
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">
                    LIVE PRICE (IDR)
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {stock.price.toLocaleString()}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold flex items-center gap-1 ${
                      stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <span>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent}%</span>
                    <span className="text-[10px] text-neutral-400">
                      ({stock.change >= 0 ? "+" : ""}{stock.change})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">
                    RADAR SCORE
                  </div>
                  <div className="text-2xl font-black font-mono text-yellow-400 mt-0.5">
                    {stock.baseScore}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Confidence: 96.4%
                  </div>
                </div>
              </div>

              {/* Sparkline Visualizer */}
              <div className="my-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                  <span>30-Day Accumulation Velocity</span>
                  <span className="text-yellow-400 font-bold">RSI: 62.4</span>
                </div>
                <div className="h-8 flex items-end gap-1 px-1 bg-neutral-950/60 rounded-lg">
                  {stock.priceHistory.map((p, i) => {
                    const min = Math.min(...stock.priceHistory.map((x) => x.price));
                    const max = Math.max(...stock.priceHistory.map((x) => x.price));
                    const h = ((p.price - min) / (max - min || 1)) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-yellow-400/60 rounded-t-sm hover:bg-yellow-300 transition-all"
                        style={{ height: `${Math.max(h, 20)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  setCurrentView("detail");
                }}
                className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)]"
              >
                <span>Full Intelligence</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MORE INSTRUMENTS SECTION */}
      {unwatchedStocks.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-neutral-800 mt-8 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Plus className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              AVAILABLE INSTRUMENTS TO TRACK
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {unwatchedStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-yellow-500/40 flex items-center justify-between transition-all"
              >
                <div>
                  <div className="font-mono font-bold text-sm text-white">
                    {stock.symbol}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate max-w-[130px]">
                    {stock.name}
                  </div>
                </div>

                <button
                  onClick={() => toggleWatchlist(stock.symbol)}
                  className="px-2.5 py-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Track</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
