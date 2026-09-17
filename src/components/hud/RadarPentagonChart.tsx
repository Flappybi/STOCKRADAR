"use client";

import React from "react";
import { RadarMetrics } from "@/types/stock";

interface RadarPentagonChartProps {
  metrics: RadarMetrics;
  compareMetrics?: RadarMetrics;
  size?: number;
  primaryLabel?: string;
  compareLabel?: string;
}

export default function RadarPentagonChart({
  metrics,
  compareMetrics,
  size = 320,
  primaryLabel = "Target Stock",
  compareLabel = "Benchmark",
}: RadarPentagonChartProps) {
  const axes = [
    { key: "quality", label: "QUALITY", value: metrics.quality, compareVal: compareMetrics?.quality },
    { key: "growth", label: "GROWTH", value: metrics.growth, compareVal: compareMetrics?.growth },
    { key: "momentum", label: "MOMENTUM", value: metrics.momentum, compareVal: compareMetrics?.momentum },
    { key: "value", label: "VALUE", value: metrics.value, compareVal: compareMetrics?.value },
    { key: "risk", label: "RISK SAFETY", value: metrics.risk, compareVal: compareMetrics?.risk },
  ] as const;

  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = axes.length;

  const getCoordinates = (index: number, val: number, maxVal = 100) => {
    const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const primaryPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.value);
      return `${x},${y}`;
    })
    .join(" ");

  const comparePoints = compareMetrics
    ? axes
        .map((axis, i) => {
          const { x, y } = getCoordinates(i, axis.compareVal ?? 50);
          return `${x},${y}`;
        })
        .join(" ")
    : null;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="pentagonYellowFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(250, 204, 21, 0.35)" />
            <stop offset="100%" stopColor="rgba(234, 179, 8, 0.12)" />
          </linearGradient>
          <linearGradient id="compareAmberFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.3)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.1)" />
          </linearGradient>
          <filter id="vertexYellowGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric Web Rings */}
        {gridLevels.map((lvl) => {
          const points = axes
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={points}
              fill="none"
              stroke="rgba(234, 179, 8, 0.2)"
              strokeWidth="1"
              strokeDasharray={lvl === 1.0 ? "none" : "2 3"}
            />
          );
        })}

        {/* Axis Lines from Center to Edges */}
        {axes.map((_, i) => {
          const edge = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke="rgba(250, 204, 21, 0.25)"
              strokeWidth="1"
            />
          );
        })}

        {/* Comparison Polygon if enabled */}
        {comparePoints && (
          <polygon
            points={comparePoints}
            fill="url(#compareAmberFill)"
            stroke="#f59e0b"
            strokeWidth="2"
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Primary Stock Polygon in Cyber Yellow */}
        <polygon
          points={primaryPoints}
          fill="url(#pentagonYellowFill)"
          stroke="#facc15"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Primary Vertex Nodes */}
        {axes.map((axis, i) => {
          const pt = getCoordinates(i, axis.value);
          return (
            <circle
              key={axis.key}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#facc15"
              stroke="#000000"
              strokeWidth="2"
              filter="url(#vertexYellowGlow)"
              className="transition-all duration-700 ease-out"
            />
          );
        })}

        {/* Comparison Vertex Nodes */}
        {compareMetrics &&
          axes.map((axis, i) => {
            const pt = getCoordinates(i, axis.compareVal ?? 50);
            return (
              <circle
                key={`comp-${axis.key}`}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#f59e0b"
                stroke="#000000"
                strokeWidth="1.5"
                className="transition-all duration-700 ease-out"
              />
            );
          })}

        {/* Axis Labels & Numerical Values */}
        {axes.map((axis, i) => {
          const labelDist = radius + 24;
          const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={`lbl-${axis.key}`} className="select-none">
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-yellow-100/70 font-mono text-[10px] font-bold tracking-wider"
              >
                {axis.label}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-yellow-300 font-mono text-xs font-black"
              >
                {axis.value}
                {compareMetrics && (
                  <tspan className="fill-amber-400 font-normal"> / {axis.compareVal}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>

      {compareMetrics && (
        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <span className="text-yellow-300 font-bold">{primaryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-amber-400 font-bold">{compareLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
