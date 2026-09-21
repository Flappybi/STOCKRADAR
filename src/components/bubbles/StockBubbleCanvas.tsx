"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { StockData, SectorCluster } from "@/types/stock";
import { useRadar } from "@/context/RadarContext";
import { soundFx } from "@/utils/soundEngine";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
  Search,
  Maximize2,
  RefreshCw,
  Info,
  Compass,
} from "lucide-react";

export type BubbleMetric = "changePercent" | "radarScore" | "marketCap";

interface BubbleNode {
  stock: StockData;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  isPositive: boolean;
  color: string;
}

interface StockBubbleCanvasProps {
  stocks: StockData[];
  selectedMetric?: BubbleMetric;
  selectedSector?: string;
  searchQuery?: string;
  onSelectStock?: (stock: StockData) => void;
}

// Sector badge colors and short monograms
const SECTOR_META: Record<
  SectorCluster,
  { label: string; bg: string; border: string; text: string; iconSymbol: string }
> = {
  Banking: {
    label: "FIN",
    bg: "rgba(16, 185, 129, 0.2)",
    border: "#10b981",
    text: "#d1fae5",
    iconSymbol: "🏛️",
  },
  "Energy & Mining": {
    label: "NRG",
    bg: "rgba(249, 115, 22, 0.2)",
    border: "#f97316",
    text: "#ffedd5",
    iconSymbol: "⚡",
  },
  "Consumer Goods": {
    label: "CNS",
    bg: "rgba(236, 72, 153, 0.2)",
    border: "#ec4899",
    text: "#fce7f3",
    iconSymbol: "🛍️",
  },
  Technology: {
    label: "TEC",
    bg: "rgba(6, 182, 212, 0.2)",
    border: "#06b6d4",
    text: "#cffafe",
    iconSymbol: "🌐",
  },
  Healthcare: {
    label: "HLT",
    bg: "rgba(52, 211, 153, 0.2)",
    border: "#34d399",
    text: "#d1fae5",
    iconSymbol: "🧬",
  },
};

export default function StockBubbleCanvas({
  stocks,
  selectedMetric = "changePercent",
  selectedSector = "All",
  searchQuery = "",
  onSelectStock,
}: StockBubbleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<BubbleNode[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Interaction refs
  const mouseRef = useRef<{
    x: number;
    y: number;
    isDown: boolean;
    startX: number;
    startY: number;
    draggedNode: BubbleNode | null;
    dragOffsetX: number;
    dragOffsetY: number;
  }>({
    x: -9999,
    y: -9999,
    isDown: false,
    startX: 0,
    startY: 0,
    draggedNode: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
  });

  const [hoveredStock, setHoveredStock] = useState<StockData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Filter stocks according to sector and search
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchSector =
        selectedSector === "All" || stock.sector === selectedSector;
      const matchSearch =
        !searchQuery.trim() ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [stocks, selectedSector, searchQuery]);

  // Compute radius based on metric
  const computeTargetRadius = useCallback(
    (stock: StockData, metric: BubbleMetric, width: number, height: number): number => {
      // Dynamic base sizing depending on viewport
      const baseMin = Math.max(32, Math.min(width, height) * 0.045);
      const baseMax = Math.max(95, Math.min(width, height) * 0.14);

      if (metric === "changePercent") {
        // Find absolute change scale
        const absVal = Math.abs(stock.changePercent || 0);
        // Scaled non-linearly so top gainers (like +15% / +100% in cryptobubbles) stand out prominently
        const normalized = Math.min(1, Math.pow(absVal / 14, 0.75));
        return baseMin + (baseMax - baseMin) * normalized;
      } else if (metric === "radarScore") {
        const score = Math.max(50, Math.min(100, stock.baseScore || 75));
        const normalized = (score - 55) / 45;
        return baseMin + (baseMax - baseMin) * Math.max(0, Math.min(1, normalized));
      } else {
        // marketCap
        const cap = Math.max(10, stock.marketCapTrillionIDR || 50);
        const logVal = Math.log10(cap) / 3.3; // IDR trillions scale
        return baseMin + (baseMax - baseMin) * Math.max(0, Math.min(1, logVal));
      }
    },
    []
  );

  // Initialize or update node positions & radii
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const existingNodesMap = new Map<string, BubbleNode>();
    nodesRef.current.forEach((n) => existingNodesMap.set(n.stock.symbol, n));

    const newNodes: BubbleNode[] = filteredStocks.map((stock, i) => {
      const targetRadius = computeTargetRadius(stock, selectedMetric, width, height);
      const existing = existingNodesMap.get(stock.symbol);

      if (existing) {
        existing.stock = stock;
        existing.targetRadius = targetRadius;
        existing.isPositive = stock.changePercent >= 0;
        return existing;
      }

      // Initial placement in golden spiral or gentle cloud around center
      const angle = i * 2.399963; // Golden angle
      const dist = Math.min(width, height) * 0.28 * Math.sqrt((i + 1) / (filteredStocks.length || 1));
      const x = centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
      const y = centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 20;

      return {
        stock,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: targetRadius * 0.7, // Animate grow in
        targetRadius,
        isPositive: stock.changePercent >= 0,
        color: stock.changePercent >= 0 ? "#22c55e" : "#ef4444",
      };
    });

    nodesRef.current = newNodes;
  }, [filteredStocks, selectedMetric, computeTargetRadius]);

  // Main 60fps Animation Loop with Verlet/Circle Physics & Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Deep Cyber Space Canvas Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, "#090d14");
      bgGrad.addColorStop(0.5, "#06080c");
      bgGrad.addColorStop(1, "#020305");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid radar rings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 1;
      const maxDim = Math.max(width, height);
      for (let r = 80; r < maxDim; r += 120) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs in background
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const nodes = nodesRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouse = mouseRef.current;

      // 2. Physics Update Step
      for (let i = 0; i < nodes.length; i++) {
        const b = nodes[i];

        // Smooth radius growth/shrink transition
        b.radius += (b.targetRadius - b.radius) * 0.08;

        if (mouse.draggedNode === b) {
          // While dragging, directly follow mouse
          b.x = mouse.x + mouse.dragOffsetX;
          b.y = mouse.y + mouse.dragOffsetY;
          b.vx *= 0.5;
          b.vy *= 0.5;
        } else {
          // Center gravity force (pull towards canvas center so they cluster like CryptoBubbles)
          const dx = centerX - b.x;
          const dy = centerY - b.y;
          b.vx += dx * 0.00032;
          b.vy += dy * 0.00032;

          // Mouse gentle repulsion (liquid marbles feel)
          if (!mouse.isDown && mouse.x > 0 && mouse.y > 0) {
            const mdx = b.x - mouse.x;
            const mdy = b.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
            const repulseDist = b.radius + 60;
            if (mdist < repulseDist) {
              const repulse = ((repulseDist - mdist) / repulseDist) * 1.6;
              b.vx += (mdx / mdist) * repulse;
              b.vy += (mdy / mdist) * repulse;
            }
          }

          // Apply velocity with air friction damping
          b.vx *= 0.965;
          b.vy *= 0.965;
          b.x += b.vx;
          b.y += b.vy;

          // Boundary bounce
          const pad = b.radius;
          if (b.x < pad) {
            b.x = pad;
            b.vx = -b.vx * 0.7;
          } else if (b.x > width - pad) {
            b.x = width - pad;
            b.vx = -b.vx * 0.7;
          }

          if (b.y < pad) {
            b.y = pad;
            b.vy = -b.vy * 0.7;
          } else if (b.y > height - pad) {
            b.y = height - pad;
            b.vy = -b.vy * 0.7;
          }
        }
      }

      // Pairwise Collision Resolution (prevent overlaps, bounce nicely)
      for (let i = 0; i < nodes.length; i++) {
        const b1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b2 = nodes[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const minDist = b1.radius + b2.radius + 3; // 3px padding between bubbles

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push apart proportional to mass/radii
            const separateFactor = 0.22;
            const sepX = nx * overlap * separateFactor;
            const sepY = ny * overlap * separateFactor;

            if (mouse.draggedNode !== b1) {
              b1.x -= sepX;
              b1.y -= sepY;
              b1.vx -= nx * overlap * 0.04;
              b1.vy -= ny * overlap * 0.04;
            }
            if (mouse.draggedNode !== b2) {
              b2.x += sepX;
              b2.y += sepY;
              b2.vx += nx * overlap * 0.04;
              b2.vy += ny * overlap * 0.04;
            }
          }
        }
      }

      // 3. Render Bubbles (CryptoBubbles High-End Aesthetic)
      // Sort nodes so larger bubbles render first and smaller/hovered on top
      const sortedNodes = [...nodes].sort((a, b) => {
        if (mouse.draggedNode === a || hoveredStock?.symbol === a.stock.symbol) return 1;
        if (mouse.draggedNode === b || hoveredStock?.symbol === b.stock.symbol) return -1;
        return a.radius - b.radius;
      });

      for (let i = 0; i < sortedNodes.length; i++) {
        const b = sortedNodes[i];
        const isHovered =
          hoveredStock?.symbol === b.stock.symbol || mouse.draggedNode === b;
        const r = isHovered ? b.radius * 1.04 : b.radius;
        const isPositive = b.isPositive;

        // Outer Neon Radiant Halo Glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.shadowColor = isPositive
          ? isHovered
            ? "rgba(34, 197, 94, 0.95)"
            : "rgba(34, 197, 94, 0.45)"
          : isHovered
          ? "rgba(239, 68, 68, 0.95)"
          : "rgba(239, 68, 68, 0.45)";
        ctx.shadowBlur = isHovered ? 36 : 18;
        ctx.strokeStyle = isPositive ? "#22c55e" : "#ef4444";
        ctx.lineWidth = isHovered ? 4.5 : 2.5;
        ctx.stroke();
        ctx.restore();

        // 3D Spherical Radial Gradient Fill
        ctx.save();
        const sphereGrad = ctx.createRadialGradient(
          b.x - r * 0.35,
          b.y - r * 0.4,
          r * 0.08,
          b.x,
          b.y,
          r
        );

        if (isPositive) {
          sphereGrad.addColorStop(0, isHovered ? "rgba(74, 222, 128, 0.6)" : "rgba(34, 197, 94, 0.42)");
          sphereGrad.addColorStop(0.45, "rgba(5, 52, 23, 0.92)");
          sphereGrad.addColorStop(0.85, "rgba(2, 24, 10, 0.98)");
          sphereGrad.addColorStop(1, "rgba(0, 10, 4, 1)");
        } else {
          sphereGrad.addColorStop(0, isHovered ? "rgba(248, 113, 113, 0.6)" : "rgba(239, 68, 68, 0.42)");
          sphereGrad.addColorStop(0.45, "rgba(70, 10, 15, 0.92)");
          sphereGrad.addColorStop(0.85, "rgba(30, 2, 6, 0.98)");
          sphereGrad.addColorStop(1, "rgba(12, 0, 2, 1)");
        }

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner Specular Light Sheen (Top arc highlight)
        ctx.beginPath();
        ctx.ellipse(
          b.x,
          b.y - r * 0.52,
          r * 0.46,
          r * 0.16,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = isPositive
          ? "rgba(255, 255, 255, 0.18)"
          : "rgba(255, 255, 255, 0.14)";
        ctx.fill();

        // Secondary bottom soft rim light
        ctx.beginPath();
        ctx.arc(b.x, b.y, r - 2, Math.PI * 0.2, Math.PI * 0.8);
        ctx.strokeStyle = isPositive
          ? "rgba(34, 197, 94, 0.2)"
          : "rgba(239, 68, 68, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Content Inside Bubble
        const sectorMeta = SECTOR_META[b.stock.sector] || SECTOR_META.Banking;

        // Mini Avatar/Badge at top (visible for medium & large bubbles)
        if (r >= 38) {
          const badgeY = b.y - r * 0.44;
          const badgeR = Math.max(10, r * 0.21);

          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, badgeY, badgeR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fill();
          ctx.strokeStyle = sectorMeta.border;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Sector Symbol or Monogram
          ctx.fillStyle = sectorMeta.text;
          ctx.font = `bold ${Math.round(badgeR * 1.05)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sectorMeta.label, b.x, badgeY + 0.5);
          ctx.restore();
        }

        // Ticker Symbol (Bold, prominent, centered)
        const symbolSize = Math.max(11, Math.min(30, Math.round(r * 0.32)));
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${symbolSize}px "Outfit", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const symbolY = r >= 38 ? b.y + r * 0.02 : b.y - r * 0.12;
        ctx.fillText(b.stock.symbol, b.x, symbolY);

        // Performance / Metric Text (e.g. +3.4% or Score: 88)
        let metricText = "";
        if (selectedMetric === "changePercent") {
          const pct = b.stock.changePercent;
          metricText = (pct > 0 ? "+" : "") + pct.toFixed(1) + "%";
        } else if (selectedMetric === "radarScore") {
          metricText = `${b.stock.baseScore.toFixed(0)} PTS`;
        } else {
          metricText = `Rp ${b.stock.marketCapTrillionIDR.toFixed(0)}T`;
        }

        const metricSize = Math.max(9, Math.min(20, Math.round(r * 0.22)));
        ctx.font = `700 ${metricSize}px "Space Mono", monospace`;
        ctx.fillStyle = isPositive ? "#bbf7d0" : "#fecaca";
        const metricY = symbolY + symbolSize * 0.85;
        ctx.fillText(metricText, b.x, metricY);

        // For large centerpiece bubbles (like AKE in the user's screenshot)
        if (r >= 65) {
          // Extra indicator: Price / Sector
          ctx.font = `600 ${Math.max(9, Math.round(r * 0.13))}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
          const priceText = `Rp ${b.stock.price.toLocaleString("id-ID")}`;
          ctx.fillText(priceText, b.x, metricY + metricSize * 0.95);
        }

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [hoveredStock, selectedMetric]);

  // Find node under mouse
  const getNodeAtPos = useCallback((x: number, y: number): BubbleNode | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const b = nodes[i];
      const dx = x - b.x;
      const dy = y - b.y;
      if (dx * dx + dy * dy <= b.radius * b.radius) {
        return b;
      }
    }
    return null;
  }, []);

  // Mouse & Touch Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = getNodeAtPos(x, y);
    const mouse = mouseRef.current;
    mouse.isDown = true;
    mouse.startX = x;
    mouse.startY = y;
    mouse.x = x;
    mouse.y = y;

    if (hit) {
      mouse.draggedNode = hit;
      mouse.dragOffsetX = hit.x - x;
      mouse.dragOffsetY = hit.y - y;
      soundFx.playClick();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouse = mouseRef.current;
    mouse.x = x;
    mouse.y = y;

    const hit = getNodeAtPos(x, y);
    if (hit) {
      if (hoveredStock?.symbol !== hit.stock.symbol) {
        setHoveredStock(hit.stock);
        setTooltipPos({ x: hit.x, y: hit.y - hit.radius });
      }
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    } else {
      if (hoveredStock && !mouse.draggedNode) {
        setHoveredStock(null);
        setTooltipPos(null);
      }
      if (canvasRef.current) canvasRef.current.style.cursor = "default";
    }

    if (mouse.draggedNode) {
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouse = mouseRef.current;
    const distMoved = Math.sqrt(
      Math.pow(x - mouse.startX, 2) + Math.pow(y - mouse.startY, 2)
    );

    // If mouse didn't drag far, register as a click
    if (mouse.draggedNode && distMoved < 7) {
      soundFx.playClick();
      if (onSelectStock) {
        onSelectStock(mouse.draggedNode.stock);
      }
    }

    // Release drag with lingering fling momentum
    if (mouse.draggedNode) {
      mouse.draggedNode.vx = (x - mouse.startX) * 0.15;
      mouse.draggedNode.vy = (y - mouse.startY) * 0.15;
    }

    mouse.isDown = false;
    mouse.draggedNode = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  };

  const handlePointerLeave = () => {
    const mouse = mouseRef.current;
    mouse.isDown = false;
    mouse.draggedNode = null;
    mouse.x = -9999;
    mouse.y = -9999;
    setHoveredStock(null);
    setTooltipPos(null);
  };

  // Explode/scatter bubbles gently when user presses scatter
  const handleScatter = () => {
    soundFx.playRadarSweep();
    nodesRef.current.forEach((b) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      b.vx = Math.cos(angle) * speed;
      b.vy = Math.sin(angle) * speed;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden select-none bg-black"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full block touch-none"
      />

      {/* Floating Canvas Controls (Reset/Scatter & Count) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={handleScatter}
          title="Scatter & re-pack bubbles"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-emerald-500/10 border border-slate-700/60 hover:border-emerald-500/40 text-xs font-mono text-slate-300 hover:text-emerald-300 transition-all backdrop-blur-md shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scatter</span>
        </button>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-mono text-slate-400 backdrop-blur-md">
          <span className="text-white font-bold">{filteredStocks.length}</span>{" "}
          Bubbles
        </div>
      </div>

      {/* Hover Mini Floating Tooltip */}
      {hoveredStock && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-slate-950/95 border border-emerald-500/25 text-white shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: Math.max(100, Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 800) - 100)),
            top: Math.max(70, tooltipPos.y),
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold text-sm text-emerald-400 font-mono">
              {hoveredStock.symbol}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {hoveredStock.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-300">
              Rp {hoveredStock.price.toLocaleString("id-ID")}
            </span>
            <span
              className={`font-bold ${
                hoveredStock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {hoveredStock.changePercent >= 0 ? "+" : ""}
              {hoveredStock.changePercent.toFixed(2)}%
            </span>
            <span className="text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/30">
              Score: {hoveredStock.baseScore}
            </span>
          </div>

          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            Click to inspect stock intelligence →
          </div>
        </div>
      )}
    </div>
  );
}
