import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// Minimum groups required for regional signal
const MIN_GROUPS = 2;

// GET /api/signals/regional - Get regional price signals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId");
    const commodityId = searchParams.get("commodityId");
    const days = parseInt(searchParams.get("days") || "7");

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Build query
    const where = {
      ...(regionId && { regionId }),
      ...(commodityId && { commodityId }),
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    };

    // Get existing regional signals
    const signals = await prisma.regionalPriceSignal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    // Also get fresh group signals that can contribute
    const groupSignals = await prisma.groupPriceSignal.findMany({
      where: {
        shareWithRegion: true,
        ...(regionId && { regionId }),
        ...(commodityId && { commodityId }),
        periodStart: { gte: periodStart },
      },
      include: {
        solGroup: {
          select: { groupName: true },
        },
      },
    });

    // Group by region and commodity for aggregation preview
    const aggregations: Record<
      string,
      {
        regionId: string;
        commodityId: string;
        groups: string[];
        avgPrices: number[];
        totalObservations: number;
      }
    > = {};

    for (const gs of groupSignals) {
      const key = `${gs.regionId}|${gs.commodityId}`;
      if (!aggregations[key]) {
        aggregations[key] = {
          regionId: gs.regionId,
          commodityId: gs.commodityId,
          groups: [],
          avgPrices: [],
          totalObservations: 0,
        };
      }
      aggregations[key].groups.push(gs.solGroup.groupName);
      aggregations[key].avgPrices.push(gs.avgPrice);
      aggregations[key].totalObservations += gs.observationCount;
    }

    // Calculate potential regional signals from group data
    const potentialSignals = Object.values(aggregations)
      .filter((agg) => agg.groups.length >= MIN_GROUPS)
      .map((agg) => {
        const avg =
          agg.avgPrices.reduce((a, b) => a + b, 0) / agg.avgPrices.length;
        return {
          regionId: agg.regionId,
          commodityId: agg.commodityId,
          avgPrice: Math.round(avg * 100) / 100,
          groupCount: agg.groups.length,
          observationCount: agg.totalObservations,
          groups: agg.groups,
          isLive: false,
        };
      });

    return NextResponse.json({
      signals: signals.map((s) => ({ ...s, isLive: true })),
      potentialSignals,
      periodStart,
      periodEnd,
      minGroupsRequired: MIN_GROUPS,
    });
  } catch (error) {
    console.error("Error fetching regional signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch regional signals" },
      { status: 500 }
    );
  }
}

// POST /api/signals/regional/generate - Generate regional signals from group signals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { regionId, days = 7 } = body;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Get all group signals that consent to regional sharing
    const groupSignals = await prisma.groupPriceSignal.findMany({
      where: {
        shareWithRegion: true,
        ...(regionId && { regionId }),
        periodStart: { gte: periodStart },
      },
    });

    if (groupSignals.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No group signals available for regional aggregation",
        signalsCreated: 0,
      });
    }

    // Group by region and commodity
    const aggregations: Record<
      string,
      {
        regionId: string;
        commodityId: string;
        groupIds: Set<string>;
        avgPrices: number[];
        minPrices: number[];
        maxPrices: number[];
        medianPrices: number[];
        totalObservations: number;
      }
    > = {};

    for (const gs of groupSignals) {
      const key = `${gs.regionId}|${gs.commodityId}`;
      if (!aggregations[key]) {
        aggregations[key] = {
          regionId: gs.regionId,
          commodityId: gs.commodityId,
          groupIds: new Set(),
          avgPrices: [],
          minPrices: [],
          maxPrices: [],
          medianPrices: [],
          totalObservations: 0,
        };
      }
      aggregations[key].groupIds.add(gs.solGroupId);
      aggregations[key].avgPrices.push(gs.avgPrice);
      aggregations[key].minPrices.push(gs.minPrice);
      aggregations[key].maxPrices.push(gs.maxPrice);
      if (gs.medianPrice) aggregations[key].medianPrices.push(gs.medianPrice);
      aggregations[key].totalObservations += gs.observationCount;
    }

    // Create regional signals where we have enough groups
    const createdSignals = [];
    for (const [, agg] of Object.entries(aggregations)) {
      if (agg.groupIds.size < MIN_GROUPS) continue;

      const avgPrice =
        agg.avgPrices.reduce((a, b) => a + b, 0) / agg.avgPrices.length;
      const minPrice = Math.min(...agg.minPrices);
      const maxPrice = Math.max(...agg.maxPrices);
      const medianPrice =
        agg.medianPrices.length > 0
          ? agg.medianPrices.reduce((a, b) => a + b, 0) /
            agg.medianPrices.length
          : null;

      // Calculate standard deviation of group averages
      const squareDiffs = agg.avgPrices.map((p) => Math.pow(p - avgPrice, 2));
      const stdDev = Math.sqrt(
        squareDiffs.reduce((a, b) => a + b, 0) / agg.avgPrices.length
      );

      // Confidence score based on number of groups and observations
      const groupFactor = Math.min(agg.groupIds.size / 5, 1); // Max at 5 groups
      const observationFactor = Math.min(agg.totalObservations / 20, 1); // Max at 20 obs
      const confidenceScore = (groupFactor + observationFactor) / 2;

      const signal = await prisma.regionalPriceSignal.upsert({
        where: {
          regionId_commodityId_periodStart: {
            regionId: agg.regionId,
            commodityId: agg.commodityId,
            periodStart,
          },
        },
        update: {
          avgPrice,
          minPrice,
          maxPrice,
          medianPrice,
          stdDeviation: stdDev,
          groupCount: agg.groupIds.size,
          observationCount: agg.totalObservations,
          confidenceScore,
          periodEnd,
        },
        create: {
          regionId: agg.regionId,
          commodityId: agg.commodityId,
          avgPrice,
          minPrice,
          maxPrice,
          medianPrice,
          stdDeviation: stdDev,
          groupCount: agg.groupIds.size,
          observationCount: agg.totalObservations,
          minGroups: MIN_GROUPS,
          confidenceScore,
          periodStart,
          periodEnd,
        },
      });

      createdSignals.push(signal);
    }

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      signals: createdSignals,
    });
  } catch (error) {
    console.error("Error generating regional signals:", error);
    return NextResponse.json(
      { error: "Failed to generate regional signals" },
      { status: 500 }
    );
  }
}
