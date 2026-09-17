"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { StockData, StrategyWeights } from "@/types/stock";
import { INITIAL_STOCKS, DEFAULT_STRATEGY_WEIGHTS, calculateRadarScore, STRATEGY_PRESETS } from "@/data/stocksData";
import { soundFx } from "@/utils/soundEngine";

export type ViewType =
  | "landing"
  | "scanner"
  | "dashboard"
  | "mobile"
  | "screener"
  | "detail"
  | "insight"
  | "comparison"
  | "galaxy"
  | "watchlist"
  | "methodology";

export type DeviceMode = "auto" | "desktop" | "mobile";

interface RadarContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  comparisonSymbols: [string, string];
  setComparisonSymbols: (pair: [string, string]) => void;
  strategyWeights: StrategyWeights;
  setStrategyWeights: (w: StrategyWeights) => void;
  activePreset: string;
  applyPreset: (presetId: string) => void;
  stocks: StockData[];
  selectedStock: StockData;
  watchlistSymbols: string[];
  toggleWatchlist: (symbol: string) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isAskAiOpen: boolean;
  setIsAskAiOpen: (open: boolean) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  triggerMarketScan: () => void;
}

const RadarContext = createContext<RadarContextType | undefined>(undefined);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentViewRaw] = useState<ViewType>("landing");
  const [selectedSymbol, setSelectedSymbolRaw] = useState<string>("BBCA");
  const [comparisonSymbols, setComparisonSymbols] = useState<[string, string]>(["BBCA", "BBRI"]);
  const [strategyWeights, setStrategyWeights] = useState<StrategyWeights>(DEFAULT_STRATEGY_WEIGHTS);
  const [activePreset, setActivePreset] = useState<string>("balanced");
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(["BBCA", "TLKM", "ASII", "AMMN"]);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("auto");
  const [liveStocks, setLiveStocks] = useState<StockData[]>(INITIAL_STOCKS);

  const setCurrentView = useCallback((view: ViewType) => {
    soundFx.playClick();
    setCurrentViewRaw(view);
  }, []);

  const setSelectedSymbol = useCallback((sym: string) => {
    soundFx.playClick();
    setSelectedSymbolRaw(sym);
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      soundFx.enabled = next;
      if (next) soundFx.playClick();
      return next;
    });
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    soundFx.playClick();
    setWatchlistSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    soundFx.playClick();
    const found = STRATEGY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setActivePreset(presetId);
      setStrategyWeights(found.weights);
    }
  }, []);

  const triggerMarketScan = useCallback(() => {
    soundFx.playRadarSweep();
    setCurrentViewRaw("scanner");
  }, []);

  // Compute live scores based on dynamic strategy weights
  const stocks = useMemo(() => {
    return liveStocks.map((stock) => {
      const calculated = calculateRadarScore(stock.metrics, strategyWeights);
      return {
        ...stock,
        baseScore: calculated,
      };
    }).sort((a, b) => b.baseScore - a.baseScore);
  }, [liveStocks, strategyWeights]);

  const selectedStock = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  }, [stocks, selectedSymbol]);

  // Subtle live tick simulation to create that living Bloomberg Terminal heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStocks((current) => {
        const randIndex = Math.floor(Math.random() * current.length);
        const target = current[randIndex];
        const delta = (Math.random() - 0.48) * (target.price * 0.003);
        const newPrice = Math.round(target.price + delta);
        const newChange = target.change + Math.round(delta);
        const newPercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(1));

        return current.map((item, idx) => {
          if (idx === randIndex) {
            return {
              ...item,
              price: newPrice,
              change: newChange,
              changePercent: newPercent,
            };
          }
          return item;
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <RadarContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedSymbol,
        setSelectedSymbol,
        comparisonSymbols,
        setComparisonSymbols,
        strategyWeights,
        setStrategyWeights,
        activePreset,
        applyPreset,
        stocks,
        selectedStock,
        watchlistSymbols,
        toggleWatchlist,
        isSoundEnabled,
        toggleSound,
        isAskAiOpen,
        setIsAskAiOpen,
        deviceMode,
        setDeviceMode,
        triggerMarketScan,
      }}
    >
      {children}
    </RadarContext.Provider>
  );
}

export function useRadar() {
  const ctx = useContext(RadarContext);
  if (!ctx) {
    throw new Error("useRadar must be used within a RadarProvider");
  }
  return ctx;
}
