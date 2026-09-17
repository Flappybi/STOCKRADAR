"use client";

import React, { useState, useEffect } from "react";
import { useRadar } from "@/context/RadarContext";
import { soundFx } from "@/utils/soundEngine";
import confetti from "canvas-confetti";
import { Radio, CheckCircle2, ArrowRight } from "lucide-react";

export default function ScannerView() {
  const { setCurrentView, setSelectedSymbol } = useRadar();
  const [step, setStep] = useState<number>(1);
  const [companiesAnalyzed, setCompaniesAnalyzed] = useState<number>(0);
  const [signalsFound, setSignalsFound] = useState<number>(0);
  const [activeStockIdx, setActiveStockIdx] = useState<number>(0);

  const scannedStockSymbols = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII", "ICBP"];

  useEffect(() => {
    soundFx.playRadarSweep();

    const t1 = setTimeout(() => {
      setStep(2);
      soundFx.playScanBeep(700);
    }, 1200);

    const t2 = setTimeout(() => {
      setStep(3);
      soundFx.playScanBeep(880);
    }, 2600);

    const t3 = setTimeout(() => {
      setStep(4);
      soundFx.playSignalLock();
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#facc15", "#fde047", "#f59e0b", "#ffffff"],
        });
      } catch {
        // ignore
      }
    }, 4400);

    const counterInterval = setInterval(() => {
      setCompaniesAnalyzed((prev) => {
        if (prev < 850) {
          return Math.min(prev + 42, 850);
        }
        return 850;
      });
      setSignalsFound((prev) => {
        if (prev < 24) {
          return Math.min(prev + 2, 24);
        }
        return 24;
      });
    }, 90);

    const stockInterval = setInterval(() => {
      setActiveStockIdx((prev) => (prev + 1) % scannedStockSymbols.length);
    }, 280);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(counterInterval);
      clearInterval(stockInterval);
    };
  }, []);

  const handleEnterDashboard = () => {
    setSelectedSymbol("BBCA");
    setCurrentView("dashboard");
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full flex flex-col items-center justify-center p-4 bg-black overflow-hidden">
      {/* Background Cyber Scanning Grid */}
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* Rotating Radar Crosshair in Yellow */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-yellow-500/20 pointer-events-none flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
        <div className="w-[450px] h-[450px] rounded-full border border-dashed border-yellow-400/20" />
        <div className="w-[300px] h-[300px] rounded-full border border-yellow-500/30" />
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent" />
      </div>

      {/* Main Scanner Container in Yellow/Black */}
      <div className="relative z-10 max-w-xl w-full mx-auto glass-panel-glow rounded-3xl p-6 sm:p-8 border border-yellow-500/40 shadow-[0_0_50px_rgba(250,204,21,0.25)]">
        {/* Step Progression Bar */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {[
            { num: 1, label: "Radar" },
            { num: 2, label: "Streams" },
            { num: 3, label: "Particles" },
            { num: 4, label: "Signal Lock" },
          ].map((s) => (
            <div key={s.num} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step >= s.num ? "bg-yellow-400 shadow-[0_0_10px_#facc15]" : "bg-neutral-900"
                }`}
              />
              <div
                className={`text-[10px] font-mono mt-1 ${
                  step >= s.num ? "text-yellow-300 font-bold" : "text-yellow-100/30"
                }`}
              >
                STEP {s.num}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Scanning Status Display */}
        <div className="text-center my-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-xs font-mono text-yellow-300 mb-3">
            <Radio className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>
              {step === 1 && "ACTIVATING QUANTUM RADAR ARRAY..."}
              {step === 2 && "INGESTING HIGH-FREQUENCY DATA STREAMS..."}
              {step === 3 && "EXTRACTING STOCK PARTICLES..."}
              {step === 4 && "NEURAL SIGNAL DETECTED & LOCKED"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
            AUTONOMOUS MARKET SCAN
          </h2>
        </div>

        {/* Real-time Telemetry Counters */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-black/90 border border-yellow-500/20 rounded-2xl p-4 text-center">
            <div className="text-[10px] font-mono text-yellow-400/70 uppercase tracking-wider">
              COMPANIES ANALYZED
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-yellow-400 mt-1">
              {companiesAnalyzed}
            </div>
            <div className="text-[10px] text-yellow-100/50 font-mono mt-0.5">
              Across 11 IDX Sectors
            </div>
          </div>

          <div className="bg-black/90 border border-yellow-500/20 rounded-2xl p-4 text-center">
            <div className="text-[10px] font-mono text-yellow-400/70 uppercase tracking-wider">
              SIGNALS FOUND
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-yellow-300 mt-1">
              {signalsFound}
            </div>
            <div className="text-[10px] text-yellow-100/50 font-mono mt-0.5">
              High Confidence &gt; 80%
            </div>
          </div>
        </div>

        {/* Stock Particles Carousel during step 2 & 3 */}
        {step < 4 ? (
          <div className="my-6 p-4 rounded-2xl bg-black/90 border border-yellow-500/20 text-center">
            <div className="text-[10px] font-mono text-yellow-400/70 mb-2 uppercase tracking-wider">
              STREAMING ORDER BOOKS
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {scannedStockSymbols.map((sym, idx) => (
                <span
                  key={sym}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    idx === activeStockIdx
                      ? "bg-yellow-400 text-black scale-110 shadow-[0_0_15px_rgba(250,204,21,0.8)]"
                      : "bg-black text-yellow-100/60 border border-yellow-500/20"
                  }`}
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Step 4 Final High Value Signal Discovery Card in Gold/Black */
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-yellow-950/40 via-black to-neutral-950 border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-yellow-950">
              <span className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                HIGH VALUE SIGNAL DETECTED
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300">
                RANK #1
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <div className="text-4xl font-black font-mono text-white tracking-wider">
                  BBCA
                </div>
                <div className="text-xs text-yellow-100/80 font-medium">
                  Bank Central Asia Tbk
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono text-yellow-400/70 uppercase">
                  RADAR SCORE
                </div>
                <div className="text-4xl font-black font-mono text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]">
                  87.5
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-yellow-100/90 leading-relaxed font-sans">
              Exceptional quality moat detected. Industry-leading 21.4% ROE and negligible 0.6% NPL credit risk confirm immediate institutional accumulation opportunity.
            </p>
          </div>
        )}

        {/* Transition Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleEnterDashboard}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all"
          >
            <span>ENTER FINANCIAL COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
