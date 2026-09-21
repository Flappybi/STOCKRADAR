// Sectors Financial API Client (Server-side)
// Never expose this module or API keys to the browser.

const SECTORS_BASE_URL = "https://api.sectors.app";

// Server-side in-memory cache with Time-To-Live (TTL)
// Protects user API quota and provides lightning-fast (< 5ms) cached responses
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

/**
 * Base request function for Sectors Financial API v2
 */
export async function sectorsRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.SECTORS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SECTORS_API_KEY is not defined in environment variables. Please check .env.local"
    );
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SECTORS_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Check cache for GET requests
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  if (isGet) {
    const cached = getCached<T>(url);
    if (cached) {
      return cached;
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", apiKey);
  headers.set("Accept", "application/json");

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Use Next.js caching with 300s revalidation when running in Next server context
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Sectors API request failed [${response.status} ${response.statusText}]: ${errorText || url}`
      );
    }

    const data = (await response.json()) as T;

    if (isGet) {
      // Cache diperpanjang ke 60 menit untuk hemat API credits
      setCache(url, data, 60 * 60 * 1000);
    }

    return data;
  } catch (error: any) {
    console.error(`[SectorsAPI] Error fetching ${url}:`, error?.message || error);
    throw error;
  }
}

/**
 * Normalizes ticker symbol (removes .JK suffix if present for display, handles case)
 */
export function normalizeTicker(ticker: string): string {
  if (!ticker) return "";
  return ticker.toUpperCase().replace(/\.JK$/i, "").trim();
}

export interface SectorsCompanySummary {
  symbol: string;
  company_name: string;
}

export interface SectorsCompaniesResponse {
  results: SectorsCompanySummary[];
  pagination?: {
    total_count: number;
    showing: number;
    limit: number;
    offset: number;
    has_next: boolean;
  };
}

/**
 * 1. getStocks: Get list of top IDX companies ordered by market cap
 */
export async function getStocks(limit: number = 25): Promise<SectorsCompanySummary[]> {
  const cacheKey = `stocks_list_${limit}`;
  const cached = getCached<SectorsCompanySummary[]>(cacheKey);
  if (cached) return cached;

  const response = await sectorsRequest<SectorsCompaniesResponse>(
    `/v2/companies/?order_by=-market_cap&limit=${limit}`
  );

  const list = response?.results || [];
  setCache(cacheKey, list, 60 * 60 * 1000); // 60 menit cache
  return list;
}

export interface SectorsCompanyReport {
  symbol: string;
  company_name: string;
  overview?: {
    listing_board?: string;
    industry?: string;
    sub_industry?: string;
    sector?: string;
    sub_sector?: string;
    market_cap?: number;
    market_cap_rank?: number;
    address?: string;
    employee_num?: number;
    employee_num_rank?: number;
    listing_date?: string;
    website?: string;
    phone?: string;
    email?: string;
    last_close_price?: number;
    latest_close_date?: string;
    daily_close_change?: number;
    all_time_price?: Record<string, any>;
    esg_score?: number;
    tags?: string[];
    indices?: string[];
    affiliates?: string[];
  };
  financials?: {
    eps?: number;
    historical_eps?: Record<string, number>;
    historical_financials?: Array<Record<string, any>>;
    historical_financial_ratio?: Array<Record<string, any>>;
    yoy_quarter_earnings_growth?: number;
    yoy_quarter_revenue_growth?: number;
  };
  valuation?: {
    last_close_price?: number;
    latest_close_date?: string;
    daily_close_change?: number;
    forward_pe?: number;
    intrinsic_value?: number;
    historical_valuation?: Array<Record<string, any>>;
  };
}

/**
 * 2. getCompanyDetail: Get comprehensive company detail report
 */
export async function getCompanyDetail(ticker: string): Promise<SectorsCompanyReport> {
  const cleanTicker = normalizeTicker(ticker);
  const cacheKey = `company_detail_${cleanTicker}`;
  const cached = getCached<SectorsCompanyReport>(cacheKey);
  if (cached) return cached;

  const data = await sectorsRequest<SectorsCompanyReport>(
    `/v2/company/report/${cleanTicker}/?sections=overview,financials,valuation`
  );

  setCache(cacheKey, data, 60 * 60 * 1000); // 60 menit cache
  return data;
}

/**
 * 3. getFinancialData: Extract or fetch detailed financial metrics for ticker
 */
export async function getFinancialData(ticker: string): Promise<{
  report: SectorsCompanyReport;
  latestRatios?: Record<string, any>;
  latestFinancials?: Record<string, any>;
}> {
  const detail = await getCompanyDetail(ticker);
  const ratiosList = detail.financials?.historical_financial_ratio || [];
  const financialsList = detail.financials?.historical_financials || [];

  // Sort descending by year if year field exists
  const latestRatios = ratiosList[0] || {};
  const latestFinancials = financialsList[0] || {};

  return {
    report: detail,
    latestRatios,
    latestFinancials,
  };
}

export interface SectorsDailyPricePoint {
  symbol: string;
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  market_cap: number;
}

export interface SectorsMarketData {
  ihsg?: Array<{ index_code: string; date: string; price: number }>;
  topGainers?: any[];
  topLosers?: any[];
  tickerDailyHistory?: SectorsDailyPricePoint[];
  lastUpdated: string;
}

/**
 * 4. getMarketData: Get daily transaction data for ticker OR overall market indicators
 */
export async function getMarketData(ticker?: string): Promise<SectorsMarketData> {
  const cleanTicker = ticker ? normalizeTicker(ticker) : null;
  const cacheKey = cleanTicker ? `market_data_${cleanTicker}` : `market_data_universe`;
  const cached = getCached<SectorsMarketData>(cacheKey);
  if (cached) return cached;

  if (cleanTicker) {
    try {
      const dailyData = await sectorsRequest<SectorsDailyPricePoint[]>(
        `/v2/daily/${cleanTicker}/`
      );
      const result: SectorsMarketData = {
        tickerDailyHistory: Array.isArray(dailyData) ? dailyData : [],
        lastUpdated: new Date().toISOString(),
      };
      setCache(cacheKey, result, 60 * 60 * 1000);
      return result;
    } catch {
      return { tickerDailyHistory: [], lastUpdated: new Date().toISOString() };
    }
  }

  // General market data: IHSG index only
  let ihsgData: any[] = [];

  try {
    const ihsgRes = await sectorsRequest<any[]>(`/v2/index-daily/ihsg/`);
    if (Array.isArray(ihsgRes)) ihsgData = ihsgRes;
  } catch (err) {
    console.warn("[SectorsAPI] Could not fetch IHSG index:", err);
  }

  // Skip top-movers call untuk hemat 1 API credit (data ini tidak ditampilkan UI)
  const topGainers: any[] = [];
  const topLosers: any[] = [];


  const result: SectorsMarketData = {
    ihsg: ihsgData,
    topGainers,
    topLosers,
    lastUpdated: new Date().toISOString(),
  };

  setCache(cacheKey, result, 60 * 60 * 1000);
  return result;
}
