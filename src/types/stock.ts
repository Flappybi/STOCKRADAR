export type SectorCluster =
  | "Banking"
  | "Energy & Mining"
  | "Consumer Goods"
  | "Technology"
  | "Healthcare";

export interface RadarMetrics {
  quality: number;   // 0 - 100
  growth: number;    // 0 - 100
  momentum: number;  // 0 - 100
  value: number;     // 0 - 100
  risk: number;      // 0 - 100 (higher = safer / better risk-adjusted profile)
}

export interface StrategyWeights {
  quality: number;
  growth: number;
  momentum: number;
  value: number;
  risk: number;
}

export interface FinancialMetricDetails {
  roe: string;
  per: string;
  pbv: string;
  debtToEquity: string;
  fcfYield: string;
  epsGrowth: string;
  dividendYield: string;
  volatilityBeta: string;
}

export interface PricePoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  name: string;
  sector: SectorCluster;
  price: number;
  change: number;
  changePercent: number;
  baseScore: number;
  metrics: RadarMetrics;
  financials: FinancialMetricDetails;
  signalTag: "Strong Quality" | "Growth Momentum" | "Value Opportunity" | "Institutional Inflow" | "Defensive Safe-Haven" | "High Volatility";
  status: "Strong" | "Neutral" | "Risk";
  marketCapTrillionIDR: number;
  aiAnalyst: {
    verdict: string;
    whyPoints: string[];
    riskPoints: string[];
    moatScore: number;
    targetPriceIDR: number;
    upsidePercent: number;
  };
  priceHistory: PricePoint[];
  galaxyCoords: [number, number, number]; // 3D coordinates for the galaxy view
}

export interface MarketScanEvent {
  step: number;
  title: string;
  description: string;
  companiesCount: number;
  signalsCount: number;
  activeStockSymbol?: string;
}
