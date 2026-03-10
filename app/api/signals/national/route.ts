import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Minimum regions required for national signal
const MIN_REGIONS = 2;

// GET /api/signals/national - Get national price signals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commodityId = searchParams.get("commodityId");
    const days = parseInt(searchParams.get("days") || "7");

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Get existing national signals
    const where = {
      ...(commodityId && { commodityId }),
      periodStart: { gte: periodStart },
    };

    const signals = await prisma.nationalPriceSignal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    // Also get regional signals for context
    const regionalSignals = await prisma.regionalPriceSignal.findMany({
      where: {
        ...(commodityId && { commodityId }),
        periodStart: { gte: periodStart },
      },
    });

    // Group by commodity to show regional breakdown
    const byComodity: Record<
      string,
      {
        commodityId: string;
        regions: {
          regionId: string;
          avgPrice: number;
          observationCount: number;
        }[];
      }
    > = {};

    for (const rs of regionalSignals) {
      if (!byComodity[rs.commodityId]) {
        byComodity[rs.commodityId] = {
          commodityId: rs.commodityId,
          regions: [],
        };
      }
      byComodity[rs.commodityId].regions.push({
        regionId: rs.regionId,
        avgPrice: rs.avgPrice,
        observationCount: rs.observationCount,
      });
    }

    return NextResponse.json({
      signals: signals.map((s) => ({
        ...s,
        regionalPrices: JSON.parse(s.regionalPrices),
      })),
      regionalBreakdown: Object.values(byComodity),
      periodStart,
      periodEnd,
      minRegionsRequired: MIN_REGIONS,
    });
  } catch (error) {
    console.error("Error fetching national signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch national signals" },
      { status: 500 }
    );
  }
}

// POST /api/signals/national/generate - Generate national signals from regional signals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { days = 7 } = body;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Get all regional signals
    const regionalSignals = await prisma.regionalPriceSignal.findMany({
      where: {
        periodStart: { gte: periodStart },
      },
    });

    if (regionalSignals.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No regional signals available for national aggregation",
        signalsCreated: 0,
      });
    }

    // Group by commodity
    const aggregations: Record<
      string,
      {
        commodityId: string;
        regions: Map<
          string,
          {
            avgPrice: number;
            observationCount: number;
            groupCount: number;
          }
        >;
        avgPrices: number[];
        minPrices: number[];
        maxPrices: number[];
        totalObservations: number;
        totalGroups: number;
      }
    > = {};

    for (const rs of regionalSignals) {
      if (!aggregations[rs.commodityId]) {
        aggregations[rs.commodityId] = {
          commodityId: rs.commodityId,
          regions: new Map(),
          avgPrices: [],
          minPrices: [],
          maxPrices: [],
          totalObservations: 0,
          totalGroups: 0,
        };
      }

      const agg = aggregations[rs.commodityId];
      agg.regions.set(rs.regionId, {
        avgPrice: rs.avgPrice,
        observationCount: rs.observationCount,
        groupCount: rs.groupCount,
      });
      agg.avgPrices.push(rs.avgPrice);
      agg.minPrices.push(rs.minPrice);
      agg.maxPrices.push(rs.maxPrice);
      agg.totalObservations += rs.observationCount;
      agg.totalGroups += rs.groupCount;
    }

    // Create national signals where we have enough regions
    const createdSignals = [];
    for (const [, agg] of Object.entries(aggregations)) {
      if (agg.regions.size < MIN_REGIONS) continue;

      const avgPrice =
        agg.avgPrices.reduce((a, b) => a + b, 0) / agg.avgPrices.length;
      const minPrice = Math.min(...agg.minPrices);
      const maxPrice = Math.max(...agg.maxPrices);

      // Weighted median (by observation count)
      const sortedPrices = agg.avgPrices.sort((a, b) => a - b);
      const medianPrice =
        sortedPrices.length % 2 === 0
          ? (sortedPrices[sortedPrices.length / 2 - 1] +
              sortedPrices[sortedPrices.length / 2]) /
            2
          : sortedPrices[Math.floor(sortedPrices.length / 2)];

      // Standard deviation
      const squareDiffs = agg.avgPrices.map((p) => Math.pow(p - avgPrice, 2));
      const stdDev = Math.sqrt(
        squareDiffs.reduce((a, b) => a + b, 0) / agg.avgPrices.length
      );

      // Confidence score
      const regionFactor = Math.min(agg.regions.size / 5, 1);
      const groupFactor = Math.min(agg.totalGroups / 10, 1);
      const observationFactor = Math.min(agg.totalObservations / 50, 1);
      const confidenceScore =
        (regionFactor + groupFactor + observationFactor) / 3;

      // Data quality assessment
      let dataQuality: string;
      if (confidenceScore >= 0.8) dataQuality = "high";
      else if (confidenceScore >= 0.5) dataQuality = "medium";
      else if (confidenceScore >= 0.3) dataQuality = "low";
      else dataQuality = "insufficient";

      // Regional prices breakdown
      const regionalPrices: Record<
        string,
        { avgPrice: number; observationCount: number }
      > = {};
      Array.from(agg.regions.entries()).forEach(([regionId, data]) => {
        regionalPrices[regionId] = {
          avgPrice: data.avgPrice,
          observationCount: data.observationCount,
        };
      });

      const signal = await prisma.nationalPriceSignal.upsert({
        where: {
          commodityId_periodStart: {
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
          regionalPrices: JSON.stringify(regionalPrices),
          regionCount: agg.regions.size,
          groupCount: agg.totalGroups,
          observationCount: agg.totalObservations,
          confidenceScore,
          dataQuality,
          periodEnd,
        },
        create: {
          commodityId: agg.commodityId,
          avgPrice,
          minPrice,
          maxPrice,
          medianPrice,
          stdDeviation: stdDev,
          regionalPrices: JSON.stringify(regionalPrices),
          regionCount: agg.regions.size,
          groupCount: agg.totalGroups,
          observationCount: agg.totalObservations,
          confidenceScore,
          dataQuality,
          periodStart,
          periodEnd,
        },
      });

      createdSignals.push({
        ...signal,
        regionalPrices: JSON.parse(signal.regionalPrices),
      });
    }

    return NextResponse.json({
      success: true,
      signalsCreated: createdSignals.length,
      signals: createdSignals,
    });
  } catch (error) {
    console.error("Error generating national signals:", error);
    return NextResponse.json(
      { error: "Failed to generate national signals" },
      { status: 500 }
    );
  }
}
