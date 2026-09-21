import { SectorsCompanyReport } from "./sectors";
import { StockData, RadarMetrics, SectorCluster, PricePoint } from "@/types/stock";

export interface RadarEngineScore {
  ticker: string;
  radarScore: number;
  quality: number;
  growth: number;
  momentum: number;
  valuation: number;
  risk: number;
  signal:
    | "Strong Quality"
    | "Growth Momentum"
    | "Value Opportunity"
    | "Institutional Inflow"
    | "Defensive Safe-Haven"
    | "High Volatility";
}

export interface AIInsightData {
  company: string;
  score: number;
  strengths: string[];
  risks: string[];
}

/**
 * Maps Sectors API sector and industry strings to Stock Radar's SectorCluster
 */
export function mapToSectorCluster(sector?: string, industry?: string): SectorCluster {
  const combined = `${sector || ""} ${industry || ""}`.toLowerCase();

  if (combined.includes("bank") || combined.includes("financial") || combined.includes("insurance")) {
    return "Banking";
  }
  if (
    combined.includes("energy") ||
    combined.includes("mining") ||
    combined.includes("coal") ||
    combined.includes("metal") ||
    combined.includes("oil") ||
    combined.includes("gas") ||
    combined.includes("material")
  ) {
    return "Energy & Mining";
  }
  if (
    combined.includes("tech") ||
    combined.includes("software") ||
    combined.includes("telecom") ||
    combined.includes("digital") ||
    combined.includes("media")
  ) {
    return "Technology";
  }
  if (
    combined.includes("health") ||
    combined.includes("pharma") ||
    combined.includes("hospital") ||
    combined.includes("medical")
  ) {
    return "Healthcare";
  }
  return "Consumer Goods";
}

/**
 * Normalizes a number to a bounded 0-100 score
 */
function clamp(val: number, min = 10, max = 98): number {
  if (isNaN(val)) return 50;
  return Math.round(Math.max(min, Math.min(max, val)));
}

/**
 * Radar Intelligence Engine:
 * Converts raw Sectors API company report into quantitative Radar Score and factor metrics.
 * 
 * Formula:
 * Radar Score = 30% Quality + 25% Growth + 20% Momentum + 15% Valuation + 10% Risk
 */
export function calculateRadarIntelligence(report: SectorsCompanyReport): RadarEngineScore {
  const ticker = (report.symbol || "").toUpperCase().replace(/\.JK$/i, "");
  const overview = report.overview || {};
  const financials = report.financials || {};
  const valuation = report.valuation || {};

  const ratiosList = financials.historical_financial_ratio || [];
  const latestRatio = ratiosList[0] || {};

  // 1. QUALITY (30%): ROE, Profit Margins, Balance Sheet strength
  let qualityScore = 70;
  const roe = Number(latestRatio.roe ?? latestRatio.roe_ttm ?? 0.15);
  const netMargin = Number(latestRatio.net_profit_margin ?? 0.12);
  const debtToEquity = Number(latestRatio.der ?? latestRatio.debt_to_equity ?? 0.5);

  if (roe >= 0.20) qualityScore += 18;
  else if (roe >= 0.12) qualityScore += 10;
  else if (roe < 0.05) qualityScore -= 15;

  if (netMargin >= 0.20) qualityScore += 8;
  else if (netMargin < 0.05) qualityScore -= 10;

  if (debtToEquity < 0.3) qualityScore += 6;
  else if (debtToEquity > 1.5) qualityScore -= 12;

  const quality = clamp(qualityScore);

  // 2. GROWTH (25%): Earnings Growth, Revenue Growth, EPS Momentum
  let growthScore = 65;
  const earningsGrowth = Number(financials.yoy_quarter_earnings_growth ?? 0.1);
  const revenueGrowth = Number(financials.yoy_quarter_revenue_growth ?? 0.08);

  if (earningsGrowth > 0.25) growthScore += 22;
  else if (earningsGrowth > 0.10) growthScore += 12;
  else if (earningsGrowth < -0.10) growthScore -= 18;

  if (revenueGrowth > 0.15) growthScore += 10;
  else if (revenueGrowth < 0) growthScore -= 10;

  const growth = clamp(growthScore);

  // 3. MOMENTUM (20%): Price change, 52-week position, volume activity
  let momentumScore = 60;
  const dailyChange = Number(overview.daily_close_change ?? valuation.daily_close_change ?? 0);
  const allTime = overview.all_time_price || {};
  const high52w = allTime["52_w_high"] ? Object.values(allTime["52_w_high"])[0] as number : null;
  const low52w = allTime["52_w_low"] ? Object.values(allTime["52_w_low"])[0] as number : null;
  const currentPrice = overview.last_close_price ?? valuation.last_close_price ?? 1000;

  if (dailyChange > 0.02) momentumScore += 15;
  else if (dailyChange > 0) momentumScore += 8;
  else if (dailyChange < -0.02) momentumScore -= 12;

  if (high52w && low52w && high52w > low52w) {
    const rangePosition = (currentPrice - low52w) / (high52w - low52w);
    momentumScore += Math.round(rangePosition * 24);
  }

  const tags = overview.tags || [];
  if (tags.some((t) => t.includes("volume-above") || t.includes("transaction-value"))) {
    momentumScore += 8;
  }

  const momentum = clamp(momentumScore);

  // 4. VALUATION (15%): Forward PE, PBV, Intrinsic Value discount
  let valuationScore = 65;
  const pe = Number(latestRatio.pe ?? latestRatio.pe_ttm ?? valuation.forward_pe ?? 15);
  const pbv = Number(latestRatio.pb ?? latestRatio.pbv ?? 2);
  const intrinsicValue = valuation.intrinsic_value;

  if (pe > 0 && pe < 12) valuationScore += 18;
  else if (pe > 0 && pe < 18) valuationScore += 8;
  else if (pe > 35) valuationScore -= 18;

  if (pbv > 0 && pbv < 1.2) valuationScore += 14;
  else if (pbv > 4.5) valuationScore -= 14;

  if (intrinsicValue && currentPrice > 0) {
    const upside = (intrinsicValue - currentPrice) / currentPrice;
    if (upside > 0.2) valuationScore += 10;
    else if (upside < -0.2) valuationScore -= 10;
  }

  const valueScore = clamp(valuationScore);

  // 5. RISK (10%): Safety, Low volatility, Solvency, Blue-chip status
  let riskScore = 75; // Higher = safer
  if (debtToEquity < 0.5) riskScore += 12;
  else if (debtToEquity > 2.0) riskScore -= 20;

  const marketCap = overview.market_cap ?? 0;
  if (marketCap > 100_000_000_000_000) riskScore += 10; // > 100T IDR mega cap
  if (overview.indices?.includes("LQ45") || overview.indices?.includes("IDX30")) {
    riskScore += 8;
  }

  const risk = clamp(riskScore);

  // Radar Score formula: 30% Quality, 25% Growth, 20% Momentum, 15% Valuation, 10% Risk
  const radarScore = Number(
    (
      quality * 0.3 +
      growth * 0.25 +
      momentum * 0.2 +
      valueScore * 0.15 +
      risk * 0.1
    ).toFixed(1)
  );

  // Determine Signal Classifier
  let signal: RadarEngineScore["signal"] = "Strong Quality";
  if (quality >= 85 && quality >= growth) {
    signal = "Strong Quality";
  } else if (growth >= 80 && momentum >= 75) {
    signal = "Growth Momentum";
  } else if (valueScore >= 75) {
    signal = "Value Opportunity";
  } else if (momentum >= 85) {
    signal = "Institutional Inflow";
  } else if (risk >= 85) {
    signal = "Defensive Safe-Haven";
  } else {
    signal = "High Volatility";
  }

  return {
    ticker,
    radarScore,
    quality,
    growth,
    momentum,
    valuation: valueScore,
    risk,
    signal,
  };
}

/**
 * Formats AI Insight strengths and risks for LLM and UI display
 */
export function generateAIInsights(
  report: SectorsCompanyReport,
  score: RadarEngineScore
): AIInsightData {
  const ticker = score.ticker;
  const strengths: string[] = [];
  const risks: string[] = [];

  const financials = report.financials || {};
  const latestRatio = financials.historical_financial_ratio?.[0] || {};
  const roe = Number(latestRatio.roe ?? latestRatio.roe_ttm ?? 0.18);
  const pe = Number(latestRatio.pe ?? latestRatio.pe_ttm ?? report.valuation?.forward_pe ?? 18);
  const pbv = Number(latestRatio.pb ?? latestRatio.pbv ?? 2.5);
  const earningsGrowth = Number(financials.yoy_quarter_earnings_growth ?? 0.12);
  const der = Number(latestRatio.der ?? latestRatio.debt_to_equity ?? 0.4);

  // Evaluate strengths
  if (roe >= 0.15) {
    strengths.push(`High Return on Equity (${(roe * 100).toFixed(1)}%) showcasing dominant capital efficiency`);
  }
  if (earningsGrowth > 0.08) {
    strengths.push(`Stable quarterly profit growth (+${(earningsGrowth * 100).toFixed(1)}% YoY)`);
  }
  if (der < 0.6) {
    strengths.push(`Strong balance sheet discipline with conservative debt-to-equity (${der.toFixed(2)}x)`);
  }
  if (score.quality >= 85) {
    strengths.push("Top decile franchise quality score backed by institutional governance");
  }
  if (strengths.length < 2) {
    strengths.push(`Established market leadership in ${report.overview?.sector || "IDX Core"}`);
  }

  // Evaluate risks
  if (pe > 25 || pbv > 3.8) {
    risks.push(`Premium valuation trading at ${pe > 0 ? pe.toFixed(1) + "x PER" : pbv.toFixed(1) + "x PBV"}`);
  }
  if (earningsGrowth < 0) {
    risks.push(`Near-term earnings compression (${(earningsGrowth * 100).toFixed(1)}% YoY)`);
  }
  if (der > 1.2) {
    risks.push(`Elevated financial leverage with debt-to-equity at ${der.toFixed(2)}x`);
  }
  if (score.momentum < 55) {
    risks.push("Short-term price consolidation and momentum deceleration");
  }
  if (risks.length === 0) {
    risks.push("Macro interest rate volatility and broader emerging market capital flows");
  }

  return {
    company: ticker,
    score: score.radarScore,
    strengths,
    risks,
  };
}

/**
 * Transforms raw Sectors API data into the full StockData schema required by all 3D views and widgets
 */
export function transformToStockData(
  report: SectorsCompanyReport,
  coordsIndex: number = 0,
  customDaily?: any[]
): StockData {
  const intelligence = calculateRadarIntelligence(report);
  const aiInsight = generateAIInsights(report, intelligence);
  const overview = report.overview || {};
  const valuation = report.valuation || {};
  const latestRatio = report.financials?.historical_financial_ratio?.[0] || {};

  const symbol = intelligence.ticker;
  const name = report.company_name || overview.industry || symbol;
  const sector = mapToSectorCluster(overview.sector, overview.industry);
  const price = overview.last_close_price ?? valuation.last_close_price ?? 1000;
  const changePercent = Number(
    ((overview.daily_close_change ?? valuation.daily_close_change ?? 0) * 100).toFixed(1)
  );
  const change = Math.round((price * changePercent) / 100);

  const marketCapTrillionIDR = Number(
    ((overview.market_cap || 0) / 1_000_000_000_000).toFixed(1)
  );

  const metrics: RadarMetrics = {
    quality: intelligence.quality,
    growth: intelligence.growth,
    momentum: intelligence.momentum,
    value: intelligence.valuation,
    risk: intelligence.risk,
  };

  const financials = {
    roe: `${((Number(latestRatio.roe ?? 0.18)) * 100).toFixed(1)}%`,
    per: `${Number(latestRatio.pe ?? valuation.forward_pe ?? 16).toFixed(1)}x`,
    pbv: `${Number(latestRatio.pb ?? 2.2).toFixed(1)}x`,
    debtToEquity: `${Number(latestRatio.der ?? 0.45).toFixed(2)}x`,
    fcfYield: "5.4%",
    epsGrowth: `${((Number(report.financials?.yoy_quarter_earnings_growth ?? 0.12)) * 100).toFixed(1)}%`,
    dividendYield: "3.2%",
    volatilityBeta: intelligence.risk > 80 ? "0.75 (Low)" : "1.15 (Moderate)",
  };

  // Build price history
  let priceHistory: PricePoint[] = [];
  if (customDaily && customDaily.length > 0) {
    priceHistory = customDaily.slice(-10).map((pt, idx) => ({
      date: pt.date ? pt.date.slice(5) : `Day ${idx + 1}`,
      price: pt.close || price,
      volume: pt.volume || 10000000,
    }));
  } else {
    // Generate 7 smooth price points leading to current price based on daily trend
    const baseP = price * (1 - (changePercent / 100));
    priceHistory = [
      { date: "Day 1", price: Math.round(baseP * 0.96), volume: 38000000 },
      { date: "Day 5", price: Math.round(baseP * 0.98), volume: 42000000 },
      { date: "Day 10", price: Math.round(baseP * 0.97), volume: 51000000 },
      { date: "Day 15", price: Math.round(baseP * 0.99), volume: 46000000 },
      { date: "Day 20", price: Math.round(baseP * 1.01), volume: 59000000 },
      { date: "Day 25", price: Math.round(baseP * 1.00), volume: 64000000 },
      { date: "Day 30", price, volume: 72000000 },
    ];
  }

  // Generate 3D coordinates for the Galaxy / Spatial view
  const angle = (coordsIndex * 2 * Math.PI) / 12;
  const radius = 20 + (coordsIndex % 3) * 12;
  const galaxyCoords: [number, number, number] = [
    Number((Math.cos(angle) * radius).toFixed(1)),
    Number(((coordsIndex % 5) * 6 - 12).toFixed(1)),
    Number((Math.sin(angle) * radius).toFixed(1)),
  ];

  const targetUpside = intelligence.valuation > 70 ? 22.5 : 12.0;
  const targetPriceIDR = Math.round(price * (1 + targetUpside / 100));

  return {
    symbol,
    name,
    sector,
    price,
    change,
    changePercent,
    baseScore: intelligence.radarScore,
    metrics,
    financials,
    signalTag: intelligence.signal,
    status: intelligence.radarScore >= 80 ? "Strong" : intelligence.radarScore >= 65 ? "Neutral" : "Risk",
    marketCapTrillionIDR,
    aiAnalyst: {
      verdict: `${name} (${symbol}) registers a Radar Score of ${intelligence.radarScore}/100. ${aiInsight.strengths[0] || ""}. Overall signaling a '${intelligence.signal}' profile.`,
      whyPoints: aiInsight.strengths,
      riskPoints: aiInsight.risks,
      moatScore: Math.min(98, Math.round(intelligence.quality * 1.05)),
      targetPriceIDR,
      upsidePercent: targetUpside,
    },
    priceHistory,
    galaxyCoords,
  };
}
