import { NextResponse } from "next/server";
import { getStocks } from "@/lib/sectors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 30;

    const stocks = await getStocks(limit);

    return NextResponse.json({
      success: true,
      count: stocks.length,
      stocks: stocks.map((s) => ({
        symbol: s.symbol.replace(/\.JK$/i, ""),
        name: s.company_name,
        fullSymbol: s.symbol,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API /api/stocks] Error:", error);
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
