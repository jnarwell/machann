"use client";

import { useState, useEffect, useCallback } from "react";
import { CommodityPrice } from "@/lib/api/types";
import { commodities as fallbackData } from "@/data/commodities";

interface UsePricesResult {
  prices: CommodityPrice[];
  isLoading: boolean;
  error: string | null;
  source: "live" | "cache" | "fallback";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

interface UsePricesOptions {
  refreshInterval?: number; // ms, 0 to disable
  initialFetch?: boolean;
  dataSource?: "official" | "user" | "blended";
}

/**
 * Hook for fetching commodity prices
 * Automatically falls back to mock data if API is unavailable
 */
export function usePrices(options: UsePricesOptions = {}): UsePricesResult {
  const { refreshInterval = 0, initialFetch = true, dataSource = "official" } = options;

  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "cache" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/prices?source=${dataSource}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setPrices(data.data);
      setSource(data.source);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prices");

      // Fall back to mock data
      setPrices(
        fallbackData.map((c) => ({
          ...c,
          lastUpdated: new Date().toISOString(),
        }))
      );
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, [dataSource]);

  // Initial fetch and refetch when dataSource changes
  useEffect(() => {
    if (initialFetch) {
      fetchPrices();
    } else {
      // Load fallback data immediately if not fetching
      setPrices(
        fallbackData.map((c) => ({
          ...c,
          lastUpdated: new Date().toISOString(),
        }))
      );
      setIsLoading(false);
    }
  }, [initialFetch, fetchPrices]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    source,
    lastUpdated,
    refresh: fetchPrices,
  };
}

/**
 * Hook for fetching a single commodity price
 */
export function useCommodityPrice(commodityId: string) {
  const { prices, isLoading, error, source, refresh } = usePrices();

  const commodity = prices.find((p) => p.id === commodityId) || null;

  return {
    commodity,
    isLoading,
    error,
    source,
    refresh,
  };
}
