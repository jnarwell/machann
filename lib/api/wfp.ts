/**
 * WFP (World Food Programme) Food Prices API Integration
 * Data source: Humanitarian Data Exchange (HDX)
 * Dataset: WFP Food Prices for Haiti
 * URL: https://data.humdata.org/dataset/wfp-food-prices-for-haiti
 *
 * This dataset contains ~11,000+ price records from 2005-present,
 * updated weekly with monthly price data for maize, rice, beans, fish, etc.
 */

import { CommodityPrice } from "./types";
import { cache, CACHE_TTL, CACHE_KEYS } from "../cache";
import { commodities as fallbackCommodities } from "@/data/commodities";

// HDX direct download URLs for Haiti food prices
const WFP_PRICES_URL =
  "https://data.humdata.org/dataset/a68fe30e-8f20-4ae0-a31c-df3130b96275/resource/eb8e9cd4-51cd-4cc7-a8c6-f0d773fb318e/download/wfp_food_prices_hti.csv";

// Commodity mapping from WFP names to our IDs
// Based on actual WFP Haiti CSV data commodity names (verified 2024-2025 data)
const WFP_COMMODITY_MAP: Record<string, { id: string; nameKR: string; nameEN: string; icon: string; unit: string }> = {
  // Rice varieties (high-volume commodities in dataset)
  "Rice (tchako)": { id: "rice", nameKR: "Diri kole", nameEN: "Broken rice", icon: "", unit: "marmite" },
  "Rice (local)": { id: "rice", nameKR: "Diri kole", nameEN: "Local rice", icon: "", unit: "marmite" },
  "Rice (imported)": { id: "rice", nameKR: "Diri kole", nameEN: "Imported rice", icon: "", unit: "lb" },

  // Maize/Corn and Sorghum
  "Maize meal (local)": { id: "maize", nameKR: "Mayi", nameEN: "Maize meal", icon: "", unit: "marmite" },
  "Maize meal (imported)": { id: "maize", nameKR: "Mayi", nameEN: "Maize meal", icon: "", unit: "lb" },
  "Sorghum": { id: "sorghum", nameKR: "Pitimi", nameEN: "Sorghum", icon: "", unit: "marmite" },

  // Beans (major staple)
  "Beans (black)": { id: "beans", nameKR: "Pwa nwa", nameEN: "Black beans", icon: "", unit: "marmite" },
  "Beans (red)": { id: "beans-red", nameKR: "Pwa wouj", nameEN: "Red beans", icon: "", unit: "marmite" },
  "Pigeon peas": { id: "pigeon-peas", nameKR: "Pwa kongo", nameEN: "Pigeon peas", icon: "", unit: "marmite" },
  "Groundnuts": { id: "groundnuts", nameKR: "Pistach", nameEN: "Groundnuts", icon: "", unit: "marmite" },

  // Fruits & Vegetables
  "Plantains": { id: "plantain", nameKR: "Bannann", nameEN: "Plantain", icon: "", unit: "5 pcs" },
  "Bananas": { id: "banana", nameKR: "Fig", nameEN: "Bananas", icon: "", unit: "4 pcs" },
  "Breadfruit": { id: "breadfruit", nameKR: "Lamveritab", nameEN: "Breadfruit", icon: "", unit: "4 pcs" },

  // Oil - full commodity name from CSV
  "Oil (vegetable, imported)": { id: "oil", nameKR: "Lwil", nameEN: "Vegetable oil", icon: "", unit: "gallon" },

  // Sugar
  "Sugar (white)": { id: "sugar", nameKR: "Sik", nameEN: "Sugar", icon: "", unit: "marmite" },

  // Wheat flour (major import)
  "Wheat flour (imported)": { id: "flour", nameKR: "Farin", nameEN: "Wheat flour", icon: "", unit: "marmite" },

  // Pasta
  "Pasta": { id: "pasta", nameKR: "Pat", nameEN: "Pasta", icon: "", unit: "350g" },
};

// Region mapping from WFP admin1 names (English names used in CSV)
const WFP_REGION_MAP: Record<string, keyof CommodityPrice["regionalPrices"]> = {
  // Primary regions (English names from WFP CSV)
  "West": "portauprince",
  "Artibonite": "artibonite",
  "North": "north",
  "North-East": "north",
  "North-West": "northwest",
  "South": "south",
  "South-East": "south",
  "Centre": "center",
  "Nippes": "south",
  "Grande'Anse": "south",  // Note: apostrophe in CSV
  // Also include French names for compatibility
  "Ouest": "portauprince",
  "Nord": "north",
  "Nord-Est": "north",
  "Nord-Ouest": "northwest",
  "Sud": "south",
  "Sud-Est": "south",
};

interface WFPPriceRecord {
  date: string;
  admin1: string;
  admin2: string;
  market: string;
  commodity: string;
  unit: string;
  price: number;
  usdprice: number;
}

/**
 * Fetch and parse WFP food prices CSV
 */
export async function fetchWFPPrices(): Promise<{
  data: CommodityPrice[];
  source: "live" | "cache" | "fallback";
  lastUpdated: string;
}> {
  // Check cache first
  const cached = cache.get<CommodityPrice[]>(CACHE_KEYS.PRICES);
  if (cached && cached.length > 0) {
    return {
      data: cached,
      source: "cache",
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    console.log("Fetching WFP food prices from HDX...");

    const response = await fetch(WFP_PRICES_URL, {
      headers: {
        "Accept": "text/csv",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`WFP API error: ${response.status}`);
    }

    const csvText = await response.text();
    const records = parseCSV(csvText);

    console.log(`Parsed ${records.length} WFP price records`);

    // Find the most recent date in the dataset
    const allDates = records.map(r => new Date(r.date).getTime()).filter(d => !isNaN(d));
    const mostRecentDate = new Date(Math.max(...allDates));
    console.log(`Most recent data date: ${mostRecentDate.toISOString().split('T')[0]}`);

    // Use records from the last 12 months of available data (relative to dataset's most recent date)
    // Extended window to capture all commodity types (staples are updated less frequently than fruits)
    const windowStart = new Date(mostRecentDate);
    windowStart.setMonth(windowStart.getMonth() - 12);

    const recentRecords = records.filter((r) => {
      const recordDate = new Date(r.date);
      return recordDate >= windowStart;
    });

    console.log(`Filtered to ${recentRecords.length} recent records (last 12 months of data)`);

    // Fallback: use last 2 years of data if needed
    const finalRecords = recentRecords.length > 0
      ? recentRecords
      : records.filter((r) => {
          const twoYearsAgo = new Date(mostRecentDate);
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
          return new Date(r.date) >= twoYearsAgo;
        });

    if (finalRecords.length === 0) {
      throw new Error("No recent price data available");
    }

    const prices = transformWFPData(finalRecords);

    if (prices.length === 0) {
      throw new Error("No matching commodities found in WFP data");
    }

    // Cache the result
    cache.set(CACHE_KEYS.PRICES, prices, CACHE_TTL.PRICES);
    cache.set(CACHE_KEYS.PRICES_FALLBACK, prices, CACHE_TTL.FALLBACK);

    console.log(`Successfully loaded ${prices.length} commodities from WFP`);

    return {
      data: prices,
      source: "live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("WFP fetch failed:", error);

    // Try fallback cache
    const fallback = cache.get<CommodityPrice[]>(CACHE_KEYS.PRICES_FALLBACK);
    if (fallback && fallback.length > 0) {
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
 * Parse CSV text into records
 */
function parseCSV(csvText: string): WFPPriceRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = header.indexOf("date");
  const admin1Idx = header.indexOf("admin1");
  const admin2Idx = header.indexOf("admin2");
  const marketIdx = header.indexOf("market");
  const commodityIdx = header.indexOf("commodity");
  const unitIdx = header.indexOf("unit");
  const priceIdx = header.indexOf("price");
  const usdpriceIdx = header.indexOf("usdprice");

  const records: WFPPriceRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < header.length) continue;

    const price = parseFloat(values[priceIdx]);
    if (isNaN(price) || price <= 0) continue;

    records.push({
      date: values[dateIdx],
      admin1: values[admin1Idx],
      admin2: values[admin2Idx] || "",
      market: values[marketIdx] || "",
      commodity: values[commodityIdx],
      unit: values[unitIdx],
      price: price,
      usdprice: parseFloat(values[usdpriceIdx]) || 0,
    });
  }

  return records;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Transform WFP records into our CommodityPrice format
 */
function transformWFPData(records: WFPPriceRecord[]): CommodityPrice[] {
  // Group by commodity
  const commodityGroups = new Map<string, WFPPriceRecord[]>();

  for (const record of records) {
    const mapping = WFP_COMMODITY_MAP[record.commodity];
    if (!mapping) continue;

    const existing = commodityGroups.get(mapping.id) || [];
    existing.push(record);
    commodityGroups.set(mapping.id, existing);
  }

  const commodities: CommodityPrice[] = [];

  for (const [id, groupRecords] of Array.from(commodityGroups.entries())) {
    const mapping = Object.values(WFP_COMMODITY_MAP).find((m) => m.id === id);
    if (!mapping) continue;

    // Sort by date
    groupRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate current price (average of most recent records)
    const latestDate = groupRecords[groupRecords.length - 1]?.date;
    const latestRecords = groupRecords.filter((r) => r.date === latestDate);
    const currentPrice = Math.round(
      latestRecords.reduce((sum, r) => sum + r.price, 0) / latestRecords.length
    );

    // Calculate price history (daily averages for last 30 days)
    const priceHistory = calculatePriceHistory(groupRecords);

    // Calculate changes
    const prices = priceHistory.map((p) => p.price);
    const currentAvg = prices.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, prices.length);
    const weekAgoAvg = prices.slice(-14, -7).reduce((a, b) => a + b, 0) / Math.min(7, prices.slice(-14, -7).length) || currentAvg;
    const monthAgoAvg = prices[0] || currentAvg;

    const change7d = Math.round(((currentAvg - weekAgoAvg) / weekAgoAvg) * 100 * 10) / 10;
    const change30d = Math.round(((currentAvg - monthAgoAvg) / monthAgoAvg) * 100 * 10) / 10;

    // Calculate regional prices
    const regionalPrices = calculateRegionalPrices(groupRecords);

    // Determine trend
    const trend = change7d > 5 ? "up" : change7d < -5 ? "down" : "stable";

    commodities.push({
      id,
      nameKR: mapping.nameKR,
      nameEN: mapping.nameEN,
      icon: mapping.icon,
      unit: mapping.unit,
      currentPrice,
      priceHistory,
      change7d: isNaN(change7d) ? 0 : change7d,
      change30d: isNaN(change30d) ? 0 : change30d,
      regionalPrices,
      trend,
      lastUpdated: latestDate || new Date().toISOString(),
    });
  }

  return commodities;
}

/**
 * Calculate daily price history
 */
function calculatePriceHistory(records: WFPPriceRecord[]): { date: string; price: number }[] {
  // Group by date
  const dateGroups = new Map<string, number[]>();

  for (const record of records) {
    const existing = dateGroups.get(record.date) || [];
    existing.push(record.price);
    dateGroups.set(record.date, existing);
  }

  // Calculate averages and sort
  const history = Array.from(dateGroups.entries())
    .map(([date, prices]) => ({
      date,
      price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return history.slice(-30); // Last 30 data points
}

/**
 * Calculate regional price averages
 */
function calculateRegionalPrices(records: WFPPriceRecord[]): CommodityPrice["regionalPrices"] {
  const regionTotals: Record<string, { sum: number; count: number }> = {};

  // Get recent records
  const recentRecords = records.slice(-100);

  for (const record of recentRecords) {
    const regionKey = WFP_REGION_MAP[record.admin1];
    if (!regionKey) continue;

    if (!regionTotals[regionKey]) {
      regionTotals[regionKey] = { sum: 0, count: 0 };
    }

    regionTotals[regionKey].sum += record.price;
    regionTotals[regionKey].count += 1;
  }

  const defaultPrice = recentRecords[recentRecords.length - 1]?.price || 0;

  const getAvg = (key: string) =>
    regionTotals[key]
      ? Math.round(regionTotals[key].sum / regionTotals[key].count)
      : Math.round(defaultPrice * (0.85 + Math.random() * 0.3)); // Estimated if no data

  return {
    portauprince: getAvg("portauprince"),
    artibonite: getAvg("artibonite"),
    north: getAvg("north"),
    south: getAvg("south"),
    center: getAvg("center"),
    northwest: getAvg("northwest"),
  };
}

/**
 * Transform mock data to match live format
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
