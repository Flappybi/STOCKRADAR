"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRadar, ViewType } from "@/context/RadarContext";
import {
  Monitor,
  Compass,
  Layers,
  Sliders,
  GitCompare,
  Eye,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  ChevronDown,
  Activity,
  Menu,
  X,
} from "lucide-react";

interface NavCategory {
  id: string;
  name: string;
  badge?: string;
  items: {
    id: ViewType;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[];
}

export default function NavigationHeader() {
  const {
    currentView,
    setCurrentView,
    isSoundEnabled,
    toggleSound,
    setIsAskAiOpen,
    triggerMarketScan,
  } = useRadar();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories: NavCategory[] = [
    {
      id: "command",
      name: "Command",
      badge: "3D Spatial",
      items: [
        {
          id: "dashboard",
          label: "Command Center",
          sublabel: "3-Panel Mission Control & Globe",
          icon: <Monitor className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: "galaxy",
          label: "3D Equity Galaxy",
          sublabel: "Celestial Market Map & Nebulae",
          icon: <Compass className="w-4 h-4 text-amber-400" />,
        },
        {
          id: "detail",
          label: "Stock Intelligence",
          sublabel: "Holographic Cube & Deep Ratios",
          icon: <Layers className="w-4 h-4 text-yellow-300" />,
        },
      ],
    },
    {
      id: "strategy",
      name: "Strategy",
      items: [
        {
          id: "screener",
          label: "Factor Screener",
          sublabel: "Custom Strategy Weights & Ranking",
          icon: <Sliders className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: "comparison",
          label: "Stock Comparison",
          sublabel: "Dual Core Head-to-Head Showdown",
          icon: <GitCompare className="w-4 h-4 text-amber-400" />,
        },
      ],
    },
    {
      id: "telemetry",
      name: "Telemetry",
      items: [
        {
          id: "watchlist",
          label: "Live Watchlist",
          sublabel: "Real-time Order Book & Ticks",
          icon: <Eye className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: "methodology",
          label: "Methodology",
          sublabel: "Quant Pipeline & Formula Model",
          icon: <BookOpen className="w-4 h-4 text-amber-300" />,
        },
        {
          id: "scanner",
          label: "Market Scan Flow",
          sublabel: "Autonomous 4-Stage Scan Array",
          icon: <Radio className="w-4 h-4 text-yellow-500" />,
        },
      ],
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCategoryActive = (category: NavCategory) => {
    return category.items.some((item) => item.id === currentView);
  };

  const handleSelectView = (viewId: ViewType) => {
    setCurrentView(viewId);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-yellow-500/25 bg-black/90 backdrop-blur-xl px-4 py-2 transition-all">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Brand & Status Telemetry */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSelectView("landing")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)] group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4 text-black animate-pulse font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-base tracking-wider text-white group-hover:text-yellow-300 transition-colors">
                  STOCK<span className="text-yellow-400">RADAR</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/35 uppercase tracking-widest hidden sm:inline-block">
                  AI v2.5
                </span>
              </div>
              <div className="text-[10px] text-yellow-100/60 font-mono tracking-tight hidden sm:block">
                Market Intelligence Command
              </div>
            </div>
          </button>

          {/* Live Market Pulse Beacon */}
          <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-yellow-950">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-yellow-100/70">IDX:</span>
              <span className="text-yellow-300 font-bold">7,342.8 (+2.4%)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-[11px] font-mono text-yellow-300">
              <Activity className="w-3 h-3 text-yellow-400" />
              <span>24 High-Value Signals</span>
            </div>
          </div>
        </div>

        {/* COMPACT CATEGORIZED NAVBAR (Desktop) */}
        <nav ref={dropdownRef} className="hidden md:flex items-center gap-2 relative">
          {categories.map((cat) => {
            const active = isCategoryActive(cat);
            const isOpen = activeDropdown === cat.id;

            return (
              <div key={cat.id} className="relative">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    active
                      ? "bg-yellow-400/20 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                      : "bg-black border-yellow-500/20 text-yellow-100/80 hover:text-white hover:border-yellow-500/50 hover:bg-neutral-900"
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                  <span>{cat.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-yellow-500/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-yellow-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-black/95 backdrop-blur-2xl border border-yellow-500/40 rounded-2xl p-2 shadow-[0_15px_35px_rgba(0,0,0,0.9)] z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 mb-1 text-[10px] font-mono text-yellow-400/60 uppercase tracking-widest border-b border-yellow-950 flex items-center justify-between">
                      <span>{cat.name} Category</span>
                      {cat.badge && (
                        <span className="text-yellow-400 text-[9px]">{cat.badge}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {cat.items.map((item) => {
                        const isCurrent = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectView(item.id)}
                            className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                              isCurrent
                                ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/50"
                                : "hover:bg-neutral-900 text-yellow-100/80 hover:text-white"
                            }`}
                          >
                            <div className="p-1.5 rounded-lg bg-black border border-yellow-500/20 mt-0.5">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-mono font-bold text-xs flex items-center justify-between">
                                <span className="truncate">{item.label}</span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                )}
                              </div>
                              <div className="text-[10px] text-yellow-100/50 truncate mt-0.5">
                                {item.sublabel}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Controls: Re-Scan, Ask AI Copilot, Audio, Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Quick Re-Scan Button */}
          <button
            onClick={triggerMarketScan}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-900 border border-yellow-500/30 hover:border-yellow-400/60 text-yellow-300 text-xs font-mono font-semibold transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-yellow-400" />
            <span>Re-Scan</span>
          </button>

          {/* High-Impact ASK RADAR AI Copilot */}
          <button
            onClick={() => setIsAskAiOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black text-xs font-mono font-black shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>ASK RADAR AI</span>
          </button>

          {/* Sound Audio Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundEnabled ? "Mute Audio" : "Enable Audio"}
            className={`p-2 rounded-xl border transition-all ${
              isSoundEnabled
                ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                : "bg-black border-yellow-950 text-neutral-600"
            }`}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-600" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-black border border-yellow-500/30 text-yellow-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-black/95 border border-yellow-500/40 backdrop-blur-2xl shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest font-bold px-1 mb-1">
                {cat.name}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {cat.items.map((item) => {
                  const isCurrent = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectView(item.id)}
                      className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        isCurrent
                          ? "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                          : "bg-black/80 border-yellow-500/20 text-yellow-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="font-bold">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-yellow-100/40">{item.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
