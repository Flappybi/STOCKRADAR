"use client";

import React from "react";
import { useRadar, ViewType } from "@/context/RadarContext";
import { Home, Compass, Sliders, Eye, BookOpen, Sparkles } from "lucide-react";

export default function BottomNavigation() {
  const { currentView, setCurrentView, setIsAskAiOpen } = useRadar();

  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "galaxy", label: "Galaxy", icon: <Compass className="w-4 h-4" /> },
    { id: "screener", label: "Screener", icon: <Sliders className="w-4 h-4" /> },
    { id: "watchlist", label: "Watchlist", icon: <Eye className="w-4 h-4" /> },
    { id: "methodology", label: "Method", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-black/95 backdrop-blur-xl border-t border-yellow-500/25 px-3 py-2 flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const isActive =
          tab.id === "dashboard"
            ? currentView === "dashboard" || currentView === "mobile"
            : currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              isActive
                ? "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                : "text-yellow-100/40 hover:text-yellow-200"
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? "bg-yellow-400/20 text-yellow-300" : ""}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-mono tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Floating Action Button for ASK RADAR AI in Cyber Yellow */}
      <button
        onClick={() => setIsAskAiOpen(true)}
        aria-label="Ask Radar AI"
        className="absolute -top-5 right-6 w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 shadow-[0_0_20px_rgba(250,204,21,0.6)] flex items-center justify-center animate-bounce duration-1000"
      >
        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
      </button>
    </div>
  );
}
