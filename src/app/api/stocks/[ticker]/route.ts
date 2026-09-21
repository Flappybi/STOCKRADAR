import { NextResponse } from "next/server";
import { getCompanyDetail, normalizeTicker } from "@/lib/sectors";
import {
  calculateRadarIntelligence,
  generateAIInsights,
  transformToStockData,
} from "@/lib/radar-engine";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const cleanTicker = normalizeTicker(ticker);

    if (!cleanTicker) {
      return NextResponse.json(
        { success: false, error: "Ticker parameter is required" },
        { status: 400 }
      );
    }

    // Hemat 1 credit: hanya ambil company report, skip market daily history
    const report = await getCompanyDetail(cleanTicker);

    const intelligence = calculateRadarIntelligence(report);
    const aiInsights = generateAIInsights(report, intelligence);
    const stockData = transformToStockData(report, 0, []);

    return NextResponse.json({
      success: true,
      ticker: cleanTicker,
      companyName: report.company_name,
      sector: stockData.sector,
      radarScore: intelligence.radarScore,
      signal: intelligence.signal,
      intelligence,
      aiInsights,
      stockData,
      financialMetrics: stockData.financials,
      overview: report.overview,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[API /api/stocks/[ticker]] Error:`, error);
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
