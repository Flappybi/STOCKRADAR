import { NextResponse } from "next/server";
import { getCompanyDetail, normalizeTicker } from "@/lib/sectors";
import {
  calculateRadarIntelligence,
  generateAIInsights,
  transformToStockData,
  RadarEngineScore,
} from "@/lib/radar-engine";
import { INITIAL_STOCKS } from "@/data/stocksData";
import { StockData } from "@/types/stock";

export const dynamic = "force-dynamic";

// Core IDX universe to analyze and rank
// Dikurangi dari 23 → 8 ticker untuk menghemat API credits (1 credit per ticker)
const CORE_TICKERS = [
  "BBCA",
  "TLKM",
  "BBRI",
  "BMRI",
  "ASII",
  "GOTO",
  "UNVR",
  "ADRO",
];

export async function GET() {
  try {
    // Process core stocks in batches or parallel to generate radar ranking
    const stockPromises = CORE_TICKERS.map(async (ticker, idx) => {
      try {
        const report = await getCompanyDetail(ticker);
        const intelligence = calculateRadarIntelligence(report);
        const stockData = transformToStockData(report, idx);
        return {
          ticker: normalizeTicker(ticker),
          score: intelligence,
          stockData,
        };
      } catch (err: any) {
        console.warn(`[API /api/radar] Fallback for ${ticker}:`, err?.message || err);
        // Graceful fallback to initial stock entry if Sectors API lookup fails
        const fallback = INITIAL_STOCKS.find((s) => s.symbol === ticker);
        if (fallback) {
          const fallbackScore: RadarEngineScore = {
            ticker,
            radarScore: fallback.baseScore,
            quality: fallback.metrics.quality,
            growth: fallback.metrics.growth,
            momentum: fallback.metrics.momentum,
            valuation: fallback.metrics.value,
            risk: fallback.metrics.risk,
            signal: fallback.signalTag,
          };
          return {
            ticker,
            score: fallbackScore,
            stockData: fallback,
          };
        }
        return null;
      }
    });

    const results = await Promise.all(stockPromises);
    const validResults = results.filter(
      (r): r is { ticker: string; score: RadarEngineScore; stockData: StockData } => r !== null
    );

    // Sort by radarScore descending
    validResults.sort((a, b) => b.score.radarScore - a.score.radarScore);

    const stocks = validResults.map((r) => r.stockData);
    const topSignals = validResults.map((r) => ({
      ticker: r.ticker,
      name: r.stockData.name,
      radarScore: r.score.radarScore,
      quality: r.score.quality,
      growth: r.score.growth,
      momentum: r.score.momentum,
      valuation: r.score.valuation,
      risk: r.score.risk,
      signal: r.score.signal,
      price: r.stockData.price,
      changePercent: r.stockData.changePercent,
      sector: r.stockData.sector,
    }));

    return NextResponse.json({
      success: true,
      count: stocks.length,
      topSignals,
      stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API /api/radar] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sectors data unavailable. Try again.",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
