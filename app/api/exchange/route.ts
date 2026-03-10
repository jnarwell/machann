/**
 * API Route: /api/exchange
 * Returns HTG/USD exchange rates from BRH or fallback sources
 */

import { NextResponse } from "next/server";
import { fetchExchangeRates, checkExchangeApiStatus } from "@/lib/api/brh";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET() {
  try {
    const result = await fetchExchangeRates();

    return NextResponse.json({
      data: {
        official: result.data.official,
        street: result.data.street,
        spread: result.data.spread,
        history: result.data.history,
      },
      source: result.source,
      lastUpdated: result.lastUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Exchange API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch exchange rates",
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD() {
  const isHealthy = await checkExchangeApiStatus();

  return new NextResponse(null, {
    status: isHealthy ? 200 : 503,
    headers: {
      "X-API-Status": isHealthy ? "healthy" : "degraded",
    },
  });
}
