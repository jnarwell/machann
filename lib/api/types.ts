/**
 * External API response types and internal data types
 * These define the contract between external data sources and our app
 */

// ============================================
// WORLD BANK REAL-TIME FOOD PRICES
// Dataset: https://microdata.worldbank.org/index.php/catalog/4494
// ============================================

export interface WorldBankPriceRecord {
  date: string;           // YYYY-MM-DD
  admin1: string;         // Department name (Ouest, Artibonite, Nord, etc.)
  market: string;         // Market name
  commodity: string;      // Commodity name in English
  unit: string;           // kg, liter, etc.
  price: number;          // Price in HTG
  usdprice?: number;      // Price in USD if available
}

export interface WorldBankResponse {
  data: WorldBankPriceRecord[];
  lastUpdated: string;
  source: string;
}

// ============================================
// BRH EXCHANGE RATES
// Source: brh.net
// ============================================

export interface BRHRateRecord {
  date: string;
  buyRate: number;        // HTG per USD (buy)
  sellRate: number;       // HTG per USD (sell)
  referenceRate: number;  // Official reference rate
}

export interface BRHResponse {
  official: number;
  street: number;         // Estimated from spread
  history: BRHRateRecord[];
  lastUpdated: string;
}

// ============================================
// FAO GIEWS FOOD PRICES
// Source: fao.org/giews/food-prices
// ============================================

export interface FAOPriceRecord {
  date: string;
  country: string;
  market: string;
  commodity: string;
  price: number;
  currency: string;
  unit: string;
}

// ============================================
// INTERNAL APP TYPES (what components consume)
// ============================================

export interface CommodityPrice {
  id: string;
  nameKR: string;
  nameEN: string;
  icon: string;
  unit: string;
  currentPrice: number;
  previousPrice?: number;
  priceHistory: { date: string; price: number }[] | number[];
  change7d: number;
  change30d?: number;
  regionalPrices: {
    portauprince: number | null;
    artibonite: number | null;
    north: number | null;
    south: number | null;
    center?: number | null;
    northwest?: number | null;
  };
  trend: "up" | "down" | "stable";
  lastUpdated?: string;
}

export interface ExchangeRate {
  official: number;
  street: number;
  spread: number;
  history: { date: string; rate: number }[];
  lastUpdated: string;
}

export interface NewsItem {
  id: string;
  date: string;
  titleKR: string;
  titleEN: string;
  source: string;
  category: "security" | "trade" | "policy" | "market" | "organization";
  impact: "positive" | "negative" | "neutral";
  url?: string;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface APIResponse<T> {
  data: T;
  source: "live" | "cache" | "fallback";
  lastUpdated: string;
  nextUpdate?: string;
  error?: string;
}

// Commodity mapping from World Bank names to our IDs
export const COMMODITY_MAP: Record<string, { id: string; nameKR: string; nameEN: string; icon: string; unit: string }> = {
  "Rice (imported, broken)": { id: "rice", nameKR: "Diri kole", nameEN: "Broken rice", icon: "", unit: "kg" },
  "Rice (imported)": { id: "rice", nameKR: "Diri kole", nameEN: "Broken rice", icon: "", unit: "kg" },
  "Maize": { id: "maize", nameKR: "Mayi", nameEN: "Maize", icon: "", unit: "kg" },
  "Maize (white)": { id: "maize", nameKR: "Mayi", nameEN: "Maize", icon: "", unit: "kg" },
  "Beans (black)": { id: "beans", nameKR: "Pwa nwa", nameEN: "Black beans", icon: "", unit: "kg" },
  "Beans": { id: "beans", nameKR: "Pwa nwa", nameEN: "Black beans", icon: "", unit: "kg" },
  "Fish (dried)": { id: "fish", nameKR: "Pwason", nameEN: "Fish (dried)", icon: "", unit: "kg" },
  "Plantains": { id: "plantain", nameKR: "Bannann", nameEN: "Plantain", icon: "", unit: "bunch" },
  "Bananas": { id: "plantain", nameKR: "Bannann", nameEN: "Plantain", icon: "", unit: "bunch" },
  "Oil (vegetable)": { id: "oil", nameKR: "Lwil palma", nameEN: "Palm oil", icon: "", unit: "liter" },
  "Oil (palm)": { id: "oil", nameKR: "Lwil palma", nameEN: "Palm oil", icon: "", unit: "liter" },
  "Fuel (gasoline)": { id: "fuel", nameKR: "Gaz", nameEN: "Fuel (gasoline)", icon: "", unit: "gallon" },
  "Gasoline": { id: "fuel", nameKR: "Gaz", nameEN: "Fuel (gasoline)", icon: "", unit: "gallon" },
};

// Region mapping from World Bank admin1 to our keys
export const REGION_MAP: Record<string, keyof CommodityPrice["regionalPrices"]> = {
  "Ouest": "portauprince",
  "Port-au-Prince": "portauprince",
  "Artibonite": "artibonite",
  "Nord": "north",
  "Nord-Est": "north",
  "Nord-Ouest": "northwest",
  "Sud": "south",
  "Sud-Est": "south",
  "Centre": "center",
  "Nippes": "south",
  "Grande-Anse": "south",
};
