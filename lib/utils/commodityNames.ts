/**
 * Comprehensive commodity name lookup
 * Maps all commodity IDs (from both local data and FEWS NET) to localized names
 */

import { commodities } from "@/data/commodities";

// Extended commodity names for IDs from FEWS NET and other sources
const EXTENDED_COMMODITY_NAMES: Record<string, { nameKR: string; nameEN: string }> = {
  // Beans variants
  "beans-black": { nameKR: "Pwa nwa", nameEN: "Black Beans" },
  "beans-red": { nameKR: "Pwa wouj", nameEN: "Red Beans" },
  "beans-pinto": { nameKR: "Pwa pinto", nameEN: "Pinto Beans" },
  "beans-lima": { nameKR: "Pwa lima", nameEN: "Lima Beans" },

  // Oil (FEWS NET uses "oil", local uses "palmoil")
  "oil": { nameKR: "Lwil vejetal", nameEN: "Vegetable Oil" },

  // Additional commodities from FEWS NET
  "sorghum": { nameKR: "Pitimi", nameEN: "Sorghum" },
  "flour": { nameKR: "Farin ble", nameEN: "Wheat Flour" },
  "wheat": { nameKR: "Ble", nameEN: "Wheat Grain" },
  "sugar": { nameKR: "Sik", nameEN: "Sugar" },
  "pasta": { nameKR: "Espageti", nameEN: "Spaghetti" },
  "salt": { nameKR: "Sèl", nameEN: "Salt" },
  "charcoal": { nameKR: "Chabon", nameEN: "Charcoal" },
};

/**
 * Get the localized name for a commodity ID
 * Checks local commodities first, then extended names, then falls back to ID
 */
export function getCommodityName(commodityId: string, language: "kr" | "en" = "kr"): string {
  // First check local commodities
  const localCommodity = commodities.find((c) => c.id === commodityId);
  if (localCommodity) {
    return language === "kr" ? localCommodity.nameKR : localCommodity.nameEN;
  }

  // Then check extended names
  const extended = EXTENDED_COMMODITY_NAMES[commodityId];
  if (extended) {
    return language === "kr" ? extended.nameKR : extended.nameEN;
  }

  // Fallback: format the ID to be more readable
  return commodityId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get all commodity options for dropdowns
 * Combines local commodities with extended list
 */
export function getAllCommodityOptions(language: "kr" | "en" = "kr") {
  const options: { id: string; name: string }[] = [];

  // Add local commodities
  for (const c of commodities) {
    options.push({
      id: c.id,
      name: language === "kr" ? c.nameKR : c.nameEN,
    });
  }

  // Add extended commodities that aren't duplicates
  for (const [id, names] of Object.entries(EXTENDED_COMMODITY_NAMES)) {
    if (!commodities.find((c) => c.id === id)) {
      options.push({
        id,
        name: language === "kr" ? names.nameKR : names.nameEN,
      });
    }
  }

  return options.sort((a, b) => a.name.localeCompare(b.name));
}
