import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/sectors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const marketData = await getMarketData();

    return NextResponse.json({
      success: true,
      ihsg: marketData.ihsg || [],
      topGainers: marketData.topGainers || [],
      topLosers: marketData.topLosers || [],
      timestamp: marketData.lastUpdated,
    });
  } catch (error: any) {
    console.error("[API /api/market] Error:", error);
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
