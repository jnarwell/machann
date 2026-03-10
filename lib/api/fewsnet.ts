/**
 * FEWS NET API Integration
 * Fetches food price data from the FEWS NET Data Warehouse REST API
 * Data collected monthly from 10 markets across Haiti since 2005
 */

import { CommodityPrice } from "./types";
import { cache, CACHE_KEYS, CACHE_TTL } from "../cache";

const FEWSNET_API_BASE = "https://fdw.fews.net/api/marketpricefacts/";

// Map FEWS NET product names to our commodity IDs
// Group brand variants together (e.g., all rice types -> rice)
const FEWSNET_PRODUCT_MAP: Record<string, { id: string; nameKR: string; nameEN: string; category: string }> = {
  // Rice (all variants)
  "Rice (Tchako)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },
  "Rice (Milled)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },
  "Rice (4% Broken)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },
  "Rice (Bongu)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },
  "Rice (Mega)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },
  "Rice (TCS)": { id: "rice", nameKR: "Diri tchako", nameEN: "Broken Rice", category: "cereals" },

  // Maize (all variants)
  "Maize Meal": { id: "maize", nameKR: "Mayi moulen", nameEN: "Maize Meal", category: "cereals" },
  "Maize Grain (Yellow)": { id: "maize", nameKR: "Mayi moulen", nameEN: "Maize Meal", category: "cereals" },
  "Maize Meal (Alberto)": { id: "maize", nameKR: "Mayi moulen", nameEN: "Maize Meal", category: "cereals" },
  "Maize Meal (Gradoro)": { id: "maize", nameKR: "Mayi moulen", nameEN: "Maize Meal", category: "cereals" },

  // Beans
  "Beans (Black)": { id: "beans-black", nameKR: "Pwa nwa", nameEN: "Black Beans", category: "legumes" },
  "Beans (Red)": { id: "beans-red", nameKR: "Pwa wouj", nameEN: "Red Beans", category: "legumes" },
  "Beans (Pinto)": { id: "beans-pinto", nameKR: "Pwa pinto", nameEN: "Pinto Beans", category: "legumes" },
  "Beans (Lima)": { id: "beans-lima", nameKR: "Pwa lima", nameEN: "Lima Beans", category: "legumes" },

  // Sorghum
  "Sorghum": { id: "sorghum", nameKR: "Pitimi", nameEN: "Sorghum", category: "cereals" },

  // Wheat
  "Wheat Flour": { id: "flour", nameKR: "Farin ble", nameEN: "Wheat Flour", category: "cereals" },
  "Wheat Grain": { id: "wheat", nameKR: "Ble", nameEN: "Wheat Grain", category: "cereals" },

  // Oil (all brands -> single commodity)
  "Refined Vegetable Oil": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Alberto)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Bongu)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Gourmet)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Rika)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Sinistre)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },
  "Refined Vegetable Oil (Ti malice)": { id: "oil", nameKR: "Lwil vejetal", nameEN: "Vegetable Oil", category: "oils" },

  // Sugar
  "Refined sugar": { id: "sugar", nameKR: "Sik", nameEN: "Sugar", category: "other" },
  "Sugar (Cream)": { id: "sugar", nameKR: "Sik", nameEN: "Sugar", category: "other" },

  // Pasta/Spaghetti (all brands)
  "Spaghetti": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },
  "Spaghetti (Bongu)": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },
  "Spaghetti (Gourmet)": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },
  "Spaghetti (Itala)": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },
  "Spaghetti (Lavagi)": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },
  "Spaghetti (Vita)": { id: "pasta", nameKR: "Espageti", nameEN: "Spaghetti", category: "cereals" },

  // Salt
  "Salt": { id: "salt", nameKR: "Sèl", nameEN: "Salt", category: "other" },

  // Charcoal (important for cooking)
  "Charcoal": { id: "charcoal", nameKR: "Chabon", nameEN: "Charcoal", category: "fuel" },
};

// Icon mapping for commodities (text symbols, not emojis)
const COMMODITY_ICONS: Record<string, string> = {
  rice: "\u25B3",       // △ triangle (grain)
  maize: "\u25C7",      // ◇ diamond (corn kernel)
  "beans-black": "\u25CF", // ● filled circle (bean)
  "beans-red": "\u25CF",   // ● filled circle
  "beans-pinto": "\u25CF", // ● filled circle
  "beans-lima": "\u25CF",  // ● filled circle
  sorghum: "\u25B2",    // ▲ solid triangle (grain)
  flour: "\u25A1",      // □ square (bag)
  wheat: "\u25B3",      // △ triangle (grain)
  oil: "\u25C9",        // ◉ fisheye (droplet)
  sugar: "\u25A0",      // ■ solid square (cube)
  pasta: "\u2261",      // ≡ triple bar (strands)
  salt: "\u25A2",       // ▢ white square with rounded corners
  charcoal: "\u25AC",   // ▬ black rectangle (briquette)
};

// Map FEWS NET admin_1 regions to our region keys
const FEWSNET_REGION_MAP: Record<string, keyof CommodityPrice["regionalPrices"]> = {
  "Ouest": "portauprince",
  "Artibonite": "artibonite",
  "Nord": "north",
  "Nord-Est": "north",
  "Nord-Ouest": "northwest",
  "Sud": "south",
  "Sud-Est": "south",
  "Centre": "center",
  "Nippes": "south",
  "Grand'Anse": "south",
};

interface FEWSNETRecord {
  product: string;
  admin_1: string;
  market: string;
  value: number | null;
  period_date: string;
  currency: string;
  unit: string;
  common_unit: string;
  pct_change_from_one_month_ago: number | null;
  pct_change_from_one_year_ago: number | null;
  value_one_month_ago: number | null;
}

/**
 * Fetch food prices from FEWS NET API
 * Returns current prices with month-over-month changes
 */
export async function fetchFEWSNETPrices(): Promise<{
  data: CommodityPrice[];
  source: "live" | "cache" | "mock";
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
    console.log("Fetching food prices from FEWS NET API...");

    // Fetch last 8 months of data (enough for trends without overwhelming the API)
    const eightMonthsAgo = new Date();
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
    const startDate = eightMonthsAgo.toISOString().split("T")[0];

    const url = `${FEWSNET_API_BASE}?country_code=HT&format=json&start_date=${startDate}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Don't use Next.js cache for large responses
    });

    if (!response.ok) {
      throw new Error(`FEWS NET API error: ${response.status}`);
    }

    const records: FEWSNETRecord[] = await response.json();
    console.log(`Fetched ${records.length} FEWS NET records`);

    // Filter to records with actual values
    const validRecords = records.filter(
      (r) => r.value !== null && r.value > 0 && FEWSNET_PRODUCT_MAP[r.product]
    );
    console.log(`${validRecords.length} records with valid prices and mapped products`);

    if (validRecords.length === 0) {
      throw new Error("No valid price records found");
    }

    const prices = transformFEWSNETData(validRecords);

    if (prices.length === 0) {
      throw new Error("No commodities transformed from FEWS NET data");
    }

    // Cache the result
    cache.set(CACHE_KEYS.PRICES, prices, CACHE_TTL.PRICES);
    cache.set(CACHE_KEYS.PRICES_FALLBACK, prices, CACHE_TTL.FALLBACK);

    console.log(`Successfully loaded ${prices.length} commodities from FEWS NET`);

    return {
      data: prices,
      source: "live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("FEWS NET API error:", error);

    // Try fallback cache
    const fallback = cache.get<CommodityPrice[]>(CACHE_KEYS.PRICES_FALLBACK);
    if (fallback) {
      console.log("Using fallback cache for prices");
      return {
        data: fallback,
        source: "cache",
        lastUpdated: new Date().toISOString(),
      };
    }

    // Return mock data as last resort
    console.log("Using mock data for prices");
    const { commodities } = await import("@/data/commodities");
    // Convert mock data to CommodityPrice format
    const mockPrices: CommodityPrice[] = commodities.map(c => ({
      id: c.id,
      nameKR: c.nameKR,
      nameEN: c.nameEN,
      icon: c.icon,
      unit: c.unit,
      currentPrice: c.currentPrice,
      previousPrice: c.currentPrice,
      priceHistory: c.priceHistory.map((p, i) => ({ date: `day-${i}`, price: p })),
      change7d: c.change7d,
      change30d: c.change30d,
      regionalPrices: {
        portauprince: c.regionalPrices.portauprince,
        artibonite: c.regionalPrices.artibonite,
        north: c.regionalPrices.north,
        south: c.regionalPrices.south,
        center: null,
        northwest: null,
      },
      trend: c.trend,
    }));
    return {
      data: mockPrices,
      source: "mock",
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Transform FEWS NET records into CommodityPrice format
 * Groups by commodity, calculates averages and trends
 */
function transformFEWSNETData(records: FEWSNETRecord[]): CommodityPrice[] {
  // Group records by mapped commodity ID
  const commodityGroups = new Map<
    string,
    {
      config: (typeof FEWSNET_PRODUCT_MAP)[string];
      currentRecords: FEWSNETRecord[];
      previousRecords: FEWSNETRecord[];
      allRecords: FEWSNETRecord[];
    }
  >();

  // Find the most recent date in the dataset
  const allDates = records
    .map((r) => new Date(r.period_date).getTime())
    .filter((d) => !isNaN(d));
  const mostRecentDate = new Date(Math.max(...allDates));
  const mostRecentMonth = mostRecentDate.toISOString().slice(0, 7); // YYYY-MM

  // Previous month (set day to 1 first to avoid date rollover issues)
  const prevMonthDate = new Date(mostRecentDate.getFullYear(), mostRecentDate.getMonth() - 1, 1);
  const previousMonth = prevMonthDate.toISOString().slice(0, 7);

  console.log(`Most recent data: ${mostRecentMonth}, Previous: ${previousMonth}`);

  // Group records
  for (const record of records) {
    const mapping = FEWSNET_PRODUCT_MAP[record.product];
    if (!mapping) continue;

    const recordMonth = record.period_date.slice(0, 7);

    if (!commodityGroups.has(mapping.id)) {
      commodityGroups.set(mapping.id, {
        config: mapping,
        currentRecords: [],
        previousRecords: [],
        allRecords: [],
      });
    }

    const group = commodityGroups.get(mapping.id)!;
    group.allRecords.push(record);

    if (recordMonth === mostRecentMonth) {
      group.currentRecords.push(record);
    } else if (recordMonth === previousMonth) {
      group.previousRecords.push(record);
    }
  }

  // Transform to CommodityPrice
  const prices: CommodityPrice[] = [];

  for (const [id, group] of Array.from(commodityGroups.entries())) {
    // Need current month data
    if (group.currentRecords.length === 0) continue;

    // Calculate national average (current month)
    const currentAvg =
      group.currentRecords.reduce((sum, r) => sum + (r.value || 0), 0) /
      group.currentRecords.length;

    // Calculate previous month average
    const previousAvg =
      group.previousRecords.length > 0
        ? group.previousRecords.reduce((sum, r) => sum + (r.value || 0), 0) /
          group.previousRecords.length
        : currentAvg;

    // Calculate month-over-month change
    const monthChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Determine trend (threshold ±0.5% to accurately reflect actual changes)
    let trend: "up" | "down" | "stable" = "stable";
    if (monthChange > 0.5) trend = "up";
    else if (monthChange < -0.5) trend = "down";

    // Calculate regional prices (current month only)
    const regionalPrices: CommodityPrice["regionalPrices"] = {
      portauprince: null,
      artibonite: null,
      north: null,
      south: null,
      center: null,
      northwest: null,
    };

    for (const record of group.currentRecords) {
      const region = FEWSNET_REGION_MAP[record.admin_1];
      if (region) {
        // Average if multiple records for same region
        if (regionalPrices[region] === null) {
          regionalPrices[region] = record.value;
        } else {
          regionalPrices[region] = (regionalPrices[region]! + (record.value || 0)) / 2;
        }
      }
    }

    // Build historical sparkline data (last 6 months)
    const historicalData = buildHistoricalData(group.allRecords, mostRecentDate);

    // Get unit from most recent record
    const unit = group.currentRecords[0]?.unit || "unit";

    prices.push({
      id,
      nameKR: group.config.nameKR,
      nameEN: group.config.nameEN,
      icon: COMMODITY_ICONS[id] || "\u25CB", // Text symbol icons, fallback to ○
      currentPrice: Math.round(currentAvg),
      previousPrice: Math.round(previousAvg),
      unit: formatUnit(unit),
      change7d: Math.round(monthChange * 10) / 10, // Using month change
      trend,
      regionalPrices,
      priceHistory: historicalData,
    });
  }

  // Sort by category importance: cereals first, then legumes, oils, other
  const categoryOrder = ["cereals", "legumes", "oils", "fuel", "other"];
  prices.sort((a, b) => {
    const aConfig = Object.values(FEWSNET_PRODUCT_MAP).find((p) => p.id === a.id);
    const bConfig = Object.values(FEWSNET_PRODUCT_MAP).find((p) => p.id === b.id);
    const aOrder = categoryOrder.indexOf(aConfig?.category || "other");
    const bOrder = categoryOrder.indexOf(bConfig?.category || "other");
    return aOrder - bOrder;
  });

  return prices;
}

/**
 * Build historical price data for sparkline (last 6 months)
 */
function buildHistoricalData(
  records: FEWSNETRecord[],
  mostRecentDate: Date
): CommodityPrice["priceHistory"] {
  const monthlyAverages: { month: string; avg: number }[] = [];

  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(mostRecentDate);
    targetDate.setMonth(targetDate.getMonth() - i);
    const targetMonth = targetDate.toISOString().slice(0, 7);

    const monthRecords = records.filter((r) => r.period_date.slice(0, 7) === targetMonth);

    if (monthRecords.length > 0) {
      const avg =
        monthRecords.reduce((sum, r) => sum + (r.value || 0), 0) / monthRecords.length;
      monthlyAverages.push({ month: targetMonth, avg });
    }
  }

  // Convert to sparkline format
  return monthlyAverages.map((m) => ({
    date: m.month,
    price: Math.round(m.avg),
  }));
}

/**
 * Format unit for display
 */
function formatUnit(unit: string): string {
  // Clean up FEWS NET unit format (e.g., "6_lb" -> "6 lb")
  return unit.replace(/_/g, " ").replace(/(\d+)\s*lb/i, "$1 lb");
}
