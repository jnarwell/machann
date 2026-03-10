"use client";

import { useState, useEffect, useCallback } from "react";
import { ExchangeRate } from "@/lib/api/types";
import { brhData as fallbackData } from "@/data/macro";

interface UseExchangeResult {
  rates: ExchangeRate | null;
  isLoading: boolean;
  error: string | null;
  source: "live" | "cache" | "fallback";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

interface UseExchangeOptions {
  refreshInterval?: number; // ms, 0 to disable
  initialFetch?: boolean;
}

/**
 * Hook for fetching exchange rates
 * Automatically falls back to mock data if API is unavailable
 */
export function useExchange(options: UseExchangeOptions = {}): UseExchangeResult {
  const { refreshInterval = 0, initialFetch = true } = options;

  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "cache" | "fallback">("fallback");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/exchange");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setRates(data.data);
      setSource(data.source);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch rates");

      // Fall back to mock data
      setRates({
        official: fallbackData.official,
        street: fallbackData.street,
        spread: fallbackData.street - fallbackData.official,
        history: fallbackData.history,
        lastUpdated: fallbackData.lastUpdated,
      });
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (initialFetch) {
      fetchRates();
    } else {
      // Load fallback data immediately
      setRates({
        official: fallbackData.official,
        street: fallbackData.street,
        spread: fallbackData.street - fallbackData.official,
        history: fallbackData.history,
        lastUpdated: fallbackData.lastUpdated,
      });
      setIsLoading(false);
    }
  }, [initialFetch, fetchRates]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchRates, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchRates]);

  return {
    rates,
    isLoading,
    error,
    source,
    lastUpdated,
    refresh: fetchRates,
  };
}

/**
 * Format HTG amount with currency symbol
 */
export function formatHTG(amount: number): string {
  return `${amount.toLocaleString()} HTG`;
}

/**
 * Convert USD to HTG using current rate
 */
export function useUsdToHtg(usdAmount: number): {
  htgAmount: number;
  isLoading: boolean;
} {
  const { rates, isLoading } = useExchange({ initialFetch: true });

  const htgAmount = rates
    ? Math.round(usdAmount * rates.official)
    : usdAmount * 132; // Fallback rate

  return { htgAmount, isLoading };
}
