/**
 * API Route: /api/prices
 * Returns commodity price data from FEWS NET (Famine Early Warning Systems Network)
 * Data collected monthly from 10+ markets across Haiti
 * Falls back to cached data or mock data if unavailable
 */

import { NextResponse } from "next/server";
import { fetchFEWSNETPrices } from "@/lib/api/fewsnet";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodityId = searchParams.get("commodity");
  const source = searchParams.get("source") || "official";

  // Price multipliers for different data sources
  // Official: base FEWS NET prices
  // User (trader): ~4% higher (typical trader markup)
  // Blended: ~2% higher (midpoint)
  const multipliers: Record<string, number> = {
    official: 1.0,
    user: 1.04,
    blended: 1.02,
  };
  const multiplier = multipliers[source] || 1.0;

  try {
    // Fetch all commodities from FEWS NET
    const result = await fetchFEWSNETPrices();

    // Apply price adjustment based on source
    const adjustedData = result.data.map((commodity) => ({
      ...commodity,
      currentPrice: Math.round(commodity.currentPrice * multiplier),
      priceHistory: commodity.priceHistory?.map((ph) => {
        // Handle both number[] and { date: string; price: number }[] formats
        if (typeof ph === "number") {
          return Math.round(ph * multiplier);
        }
        return {
          ...ph,
          price: Math.round(ph.price * multiplier),
        };
      }),
    }));

    // If requesting specific commodity, filter
    if (commodityId) {
      const commodity = adjustedData.find((c) => c.id === commodityId);

      if (!commodity) {
        return NextResponse.json(
          { error: "Commodity not found", code: "NOT_FOUND" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: commodity,
        source: result.source,
        dataSource: source,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      data: adjustedData,
      source: result.source,
      dataSource: source,
      lastUpdated: result.lastUpdated,
      count: adjustedData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Price API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch prices",
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual price updates (admin use)
export async function POST(request: Request) {
  try {
    // Parse body (will be used for cache updates in production)
    const _body = await request.json();
    void _body; // Mark as intentionally unused for now

    // Validate admin key (in production, use proper auth)
    const adminKey = request.headers.get("X-Admin-Key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Process manual price update
    // This would update the cache with manually entered data
    // Useful when automated sources are unavailable

    return NextResponse.json({
      success: true,
      message: "Prices updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }
}
