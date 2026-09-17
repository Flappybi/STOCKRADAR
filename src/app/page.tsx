"use client";

import React from "react";
import { RadarProvider, useRadar } from "@/context/RadarContext";
import NavigationHeader from "@/components/hud/NavigationHeader";
import BottomNavigation from "@/components/hud/BottomNavigation";
import AskRadarModal from "@/components/hud/AskRadarModal";

import LandingView from "@/components/views/LandingView";
import ScannerView from "@/components/views/ScannerView";
import DesktopCommandCenter from "@/components/views/DesktopCommandCenter";
import MobileDashboard from "@/components/views/MobileDashboard";
import ScreenerView from "@/components/views/ScreenerView";
import DetailView from "@/components/views/DetailView";
import ComparisonView from "@/components/views/ComparisonView";
import GalaxyView from "@/components/views/GalaxyView";
import WatchlistView from "@/components/views/WatchlistView";
import MethodologyView from "@/components/views/MethodologyView";

function MainContent() {
  const { currentView } = useRadar();

  return (
    <div className="flex-1 flex flex-col w-full relative">
      {currentView === "landing" && <LandingView />}
      {currentView === "scanner" && <ScannerView />}

      {/* AUTOMATIC RESPONSIVE DASHBOARD:
          On desktop (lg and up) -> 3-Panel AI Command Center
          On mobile / tablet (< lg) -> Personal AI Stock Radar Assistant
      */}
      {(currentView === "dashboard" || currentView === "mobile") && (
        <>
          <div className="hidden lg:block w-full">
            <DesktopCommandCenter />
          </div>
          <div className="block lg:hidden w-full">
            <MobileDashboard />
          </div>
        </>
      )}

      {currentView === "screener" && <ScreenerView />}
      {currentView === "detail" && <DetailView />}
      {currentView === "comparison" && <ComparisonView />}
      {currentView === "galaxy" && <GalaxyView />}
      {currentView === "watchlist" && <WatchlistView />}
      {currentView === "methodology" && <MethodologyView />}

      {/* Automatic Mobile Bottom Navigation (Visible on mobile/tablet, hidden on desktop) */}
      <BottomNavigation />
    </div>
  );
}

export default function Home() {
  return (
    <RadarProvider>
      <main className="min-h-screen flex flex-col bg-black selection:bg-yellow-500/30 selection:text-yellow-200">
        <NavigationHeader />
        <MainContent />
        <AskRadarModal />
      </main>
    </RadarProvider>
  );
}
