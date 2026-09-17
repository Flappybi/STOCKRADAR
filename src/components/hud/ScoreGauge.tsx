"use client";

import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export default function ScoreGauge({
  score,
  size = 240,
  label = "STOCK RADAR SCORE",
  sublabel = "NEURAL CONVERGENCE: 96.4%",
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Number((ease * score).toFixed(1));
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [score]);

  const radius = size * 0.4;
  const strokeWidth = size * 0.045;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer Rotating HUD Reticle in Yellow */}
        <div
          className="absolute inset-0 rounded-full border border-yellow-500/25 animate-spin"
          style={{ animationDuration: "35s" }}
        />
        <div
          className="absolute inset-2 rounded-full border border-dashed border-yellow-400/30 animate-spin"
          style={{ animationDuration: "50s", animationDirection: "reverse" }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(24, 24, 10, 0.9)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Secondary Tick Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + strokeWidth * 1.2}
            stroke="rgba(250, 204, 21, 0.18)"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            fill="transparent"
          />

          {/* Inner Yellow Glow Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.8}
            stroke="rgba(234, 179, 8, 0.25)"
            strokeWidth={1}
            fill="rgba(250, 204, 21, 0.03)"
          />

          {/* Active Gradient Holographic Ring in Cyber Yellow/Gold */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Holographic Telemetry */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="text-[10px] font-mono tracking-widest text-yellow-400 uppercase font-semibold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            <span>{label}</span>
          </div>

          <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_25px_rgba(250,204,21,0.7)]">
            {displayScore.toFixed(1)}
          </div>

          <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-[10px] font-mono font-bold text-yellow-300">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            STRONG ALPHA
          </div>

          <div className="text-[9px] font-mono text-yellow-100/60 mt-1 tracking-tight">
            {sublabel}
          </div>
        </div>
      </div>
    </div>
  );
}
