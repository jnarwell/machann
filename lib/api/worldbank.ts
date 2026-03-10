/**
 * World Bank Real-Time Food Prices API Integration
 * Dataset: Haiti Monthly Food Price Estimates (Catalog #4494)
 *
 * Note: The World Bank RTFP data may require authentication or be
 * available as downloadable CSV. This implementation supports both
 * API access and pre-processed data loading.
 */

import {
  WorldBankPriceRecord,
  CommodityPrice,
  COMMODITY_MAP,
  REGION_MAP
} from "./types";
import { cache, CACHE_TTL, CACHE_KEYS } from "../cache";
import { commodities as fallbackCommodities } from "@/data/commodities";

// World Bank API endpoints
const WB_API_BASE = "https://api.worldbank.org/v2";
// Microdata catalog URL for reference: https://microdata.worldbank.org/index.php/catalog/4494

// Haiti country code
const HAITI_CODE = "HTI";

/**
 * Fetch commodity prices from World Bank
 * Falls back to cached data or mock data if API is unavailable
 */
export async function fetchWorldBankPrices(): Promise<{
  data: CommodityPrice[];
  source: "live" | "cache" | "fallback";
  lastUpdated: string;
}> {
  // Check cache first
  const cached = cache.get<CommodityPrice[]>(CACHE_KEYS.PRICES);
  if (cached) {
    return {
      data: cached,
      source: "cache",
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    // Try to fetch from World Bank API
    // Note: This endpoint may need adjustment based on actual API structure
    const response = await fetch(
      `${WB_API_BASE}/country/${HAITI_CODE}/indicator/AG.PRD.FOOD.XD?format=json&date=2024:2026&per_page=1000`,
      {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 3600 }, // Next.js cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }

    const rawData = await response.json();
    const prices = transformWorldBankData(rawData);

    // If transformation returned empty, fall back to mock data
    if (!prices.length) {
      console.log("World Bank API returned no matching commodities, using mock data");
      const mockPrices = transformMockToLive(fallbackCommodities);
      return {
        data: mockPrices,
        source: "fallback",
        lastUpdated: new Date().toISOString(),
      };
    }

    // Cache the result
    cache.set(CACHE_KEYS.PRICES, prices, CACHE_TTL.PRICES);

    // Also update fallback cache
    cache.set(CACHE_KEYS.PRICES_FALLBACK, prices, CACHE_TTL.FALLBACK);

    return {
      data: prices,
      source: "live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("World Bank API fetch failed:", error);

    // Try fallback cache
    const fallback = cache.get<CommodityPrice[]>(CACHE_KEYS.PRICES_FALLBACK);
    if (fallback) {
      return {
        data: fallback,
        source: "fallback",
        lastUpdated: new Date().toISOString(),
      };
    }

    // Use mock data as last resort
    return {
      data: transformMockToLive(fallbackCommodities),
      source: "fallback",
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Fetch prices for a specific commodity
 */
export async function fetchCommodityPrice(commodityId: string): Promise<CommodityPrice | null> {
  const { data } = await fetchWorldBankPrices();
  return data.find((c) => c.id === commodityId) || null;
}

/**
 * Fetch historical prices for trend analysis
 */
export async function fetchPriceHistory(
  commodityId: string,
  days: number = 30
): Promise<{ date: string; price: number }[]> {
  const { data } = await fetchWorldBankPrices();
  const commodity = data.find((c) => c.id === commodityId);

  if (!commodity) return [];

  // Handle both number[] (mock) and {date, price}[] (live) formats
  const history = commodity.priceHistory.slice(-days);
  return history.map((p, i) => {
    if (typeof p === "number") {
      // Convert number to {date, price} format
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      return { date: date.toISOString().split("T")[0], price: p };
    }
    return p;
  });
}

/**
 * Transform World Bank API response to our internal format
 */
function transformWorldBankData(rawData: unknown): CommodityPrice[] {
  // World Bank API returns data in a specific format
  // [metadata, records[]] or similar structure

  if (!rawData || !Array.isArray(rawData)) {
    throw new Error("Invalid World Bank data format");
  }

  // Extract actual data (usually second element in array)
  const records: WorldBankPriceRecord[] = rawData[1] || rawData;

  // Group by commodity
  const commodityGroups = new Map<string, WorldBankPriceRecord[]>();

  for (const record of records) {
    const mapping = COMMODITY_MAP[record.commodity];
    if (!mapping) continue;

    const existing = commodityGroups.get(mapping.id) || [];
    existing.push(record);
    commodityGroups.set(mapping.id, existing);
  }

  // Transform each commodity group
  const commodities: CommodityPrice[] = [];

  for (const [id, records] of Array.from(commodityGroups.entries())) {
    const mapping = Object.values(COMMODITY_MAP).find((m) => m.id === id);
    if (!mapping) continue;

    // Sort by date
    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate current price (latest)
    const latestRecord = records[records.length - 1];
    const currentPrice = latestRecord?.price || 0;

    // Calculate price history
    const priceHistory = records.slice(-30).map((r) => ({
      date: r.date,
      price: r.price,
    }));

    // Calculate changes
    const price7dAgo = records[Math.max(0, records.length - 8)]?.price || currentPrice;
    const price30dAgo = records[0]?.price || currentPrice;

    const change7d = ((currentPrice - price7dAgo) / price7dAgo) * 100;
    const change30d = ((currentPrice - price30dAgo) / price30dAgo) * 100;

    // Calculate regional prices
    const regionalPrices = calculateRegionalPrices(records);

    // Determine trend
    const trend = change7d > 5 ? "up" : change7d < -5 ? "down" : "stable";

    commodities.push({
      id,
      nameKR: mapping.nameKR,
      nameEN: mapping.nameEN,
      icon: mapping.icon,
      unit: mapping.unit,
      currentPrice: Math.round(currentPrice),
      priceHistory,
      change7d: Math.round(change7d * 10) / 10,
      change30d: Math.round(change30d * 10) / 10,
      regionalPrices,
      trend,
      lastUpdated: latestRecord?.date || new Date().toISOString(),
    });
  }

  return commodities;
}

/**
 * Calculate regional price averages
 */
function calculateRegionalPrices(
  records: WorldBankPriceRecord[]
): CommodityPrice["regionalPrices"] {
  const regionTotals: Record<string, { sum: number; count: number }> = {};

  // Get only recent records (last 7 days worth)
  const recentRecords = records.slice(-50);

  for (const record of recentRecords) {
    const regionKey = REGION_MAP[record.admin1];
    if (!regionKey) continue;

    if (!regionTotals[regionKey]) {
      regionTotals[regionKey] = { sum: 0, count: 0 };
    }

    regionTotals[regionKey].sum += record.price;
    regionTotals[regionKey].count += 1;
  }

  // Calculate averages
  const defaultPrice = recentRecords[recentRecords.length - 1]?.price || 0;

  return {
    portauprince: Math.round(regionTotals.portauprince?.sum / regionTotals.portauprince?.count || defaultPrice),
    artibonite: Math.round(regionTotals.artibonite?.sum / regionTotals.artibonite?.count || defaultPrice * 0.9),
    north: Math.round(regionTotals.north?.sum / regionTotals.north?.count || defaultPrice * 0.95),
    south: Math.round(regionTotals.south?.sum / regionTotals.south?.count || defaultPrice * 0.92),
    center: Math.round(regionTotals.center?.sum / regionTotals.center?.count || defaultPrice * 0.88),
    northwest: Math.round(regionTotals.northwest?.sum / regionTotals.northwest?.count || defaultPrice * 0.85),
  };
}

/**
 * Transform mock data to match live data format
 */
function transformMockToLive(mockData: typeof fallbackCommodities): CommodityPrice[] {
  return mockData.map((c) => ({
    id: c.id,
    nameKR: c.nameKR,
    nameEN: c.nameEN,
    icon: c.icon,
    unit: c.unit,
    currentPrice: c.currentPrice,
    priceHistory: c.priceHistory,
    change7d: c.change7d,
    change30d: c.change30d,
    regionalPrices: c.regionalPrices,
    trend: c.trend,
    lastUpdated: new Date().toISOString(),
  }));
}

/**
 * Check if World Bank API is available
 */
export async function checkWorldBankStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${WB_API_BASE}/sources`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}
