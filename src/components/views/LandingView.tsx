"use client";

import React, { useState, useEffect } from "react";
import RadarSphere3D from "@/components/3d/RadarSphere3D";
import { useRadar } from "@/context/RadarContext";
import { Radio, ArrowRight, Zap, Terminal } from "lucide-react";
import { soundFx } from "@/utils/soundEngine";

const BOOT_LOGS = [
  "SYSTEM INITIALIZING...",
  "CONNECTING MARKET SIGNALS...",
  "INGESTING REAL-TIME IDX ORDER BOOKS...",
  "ANALYZING 850 LISTED CORPORATIONS...",
  "EXTRACTING QUANTITATIVE ALPHA VECTORS...",
  "GENERATING NEURAL INTELLIGENCE...",
  "SIGNALS DETECTED: 24 HIGH VALUE OPPORTUNITIES",
];

export default function LandingView() {
  const { setCurrentView, triggerMarketScan } = useRadar();
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < BOOT_LOGS.length - 1) {
          soundFx.playScanBeep(600 + prev * 80);
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-black">
      {/* 3D Giant Radar Sphere in Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-85 pointer-events-auto">
        <RadarSphere3D particleCount={1600} className="w-full h-full" />
      </div>

      {/* Cyberpunk Grid Background Overlay */}
      <div className="absolute inset-0 z-0 cyber-grid opacity-35 pointer-events-none" />

      {/* Radial Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000000_85%)] pointer-events-none" />

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Animated Boot Ticker Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/90 border border-yellow-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(250,204,21,0.3)]">
          <Terminal className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-mono text-yellow-300 font-semibold tracking-wider">
            {BOOT_LOGS[logIndex]}
          </span>
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
        </div>

        {/* Main Title & Subtitle in Yellow & Gold */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(250,204,21,0.4)]">
          STOCK <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-glow-yellow">RADAR</span>
        </h1>

        <p className="mt-3 text-lg sm:text-2xl font-mono text-yellow-300 font-medium tracking-wide">
          AI-Powered Market Intelligence Platform
        </p>

        <p className="mt-4 max-w-2xl text-sm sm:text-base text-yellow-100/80 font-sans leading-relaxed">
          &ldquo;Discover hidden opportunities through intelligent market analysis.&rdquo;
          A futuristic financial intelligence system scanning the Indonesian stock exchange,
          synthesizing multi-factor alpha, and decoding high-probability signals.
        </p>

        {/* Action Buttons in Yellow/Black */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={triggerMarketScan}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(250,204,21,0.5)] transform hover:scale-105 transition-all group"
          >
            <Radio className="w-5 h-5 text-black group-hover:animate-spin" />
            <span>START MARKET SCAN</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentView("dashboard")}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-black hover:bg-neutral-900 border border-yellow-500/40 hover:border-yellow-400 text-yellow-200 font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 backdrop-blur-xl transition-all shadow-lg"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>EXPLORE DASHBOARD</span>
          </button>
        </div>

        {/* Institutional Proof Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
          <div className="glass-panel p-3.5 rounded-xl border border-yellow-500/20 text-center">
            <div className="text-2xl font-black font-mono text-yellow-400">850+</div>
            <div className="text-[11px] font-mono text-yellow-100/60 uppercase mt-0.5">Companies Analyzed</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-yellow-500/20 text-center">
            <div className="text-2xl font-black font-mono text-yellow-300">24</div>
            <div className="text-[11px] font-mono text-yellow-100/60 uppercase mt-0.5">High-Value Signals</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-yellow-500/20 text-center">
            <div className="text-2xl font-black font-mono text-amber-400">96.4%</div>
            <div className="text-[11px] font-mono text-yellow-100/60 uppercase mt-0.5">Neural Confidence</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-yellow-500/20 text-center">
            <div className="text-2xl font-black font-mono text-yellow-500">&lt; 15ms</div>
            <div className="text-[11px] font-mono text-yellow-100/60 uppercase mt-0.5">Telemetry Latency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
