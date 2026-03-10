import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Minimum observations required for a valid signal
const MIN_OBSERVATIONS = 3;

// GET /api/signals/group - Get group price signals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const commodityId = searchParams.get("commodityId");
    const days = parseInt(searchParams.get("days") || "7");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    // Check if group exists and has sharing enabled
    const group = await prisma.solGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              include: {
                consent: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    if (!group.shareGroupPrices) {
      return NextResponse.json(
        { error: "Group price sharing is not enabled" },
        { status: 403 }
      );
    }

    // Get members who have consented to share with group
    const consentedMemberIds = group.members
      .filter((m) => m.user.consent?.shareWithGroup)
      .map((m) => m.userId);

    if (consentedMemberIds.length === 0) {
      return NextResponse.json({
        signals: [],
        message: "No members have consented to share prices",
      });
    }

    // Calculate period
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Build query for price reports
    const where = {
      userId: { in: consentedMemberIds },
      observedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      ...(commodityId && { commodityId }),
    };

    // Get price reports from consented members
    const priceReports = await prisma.priceReport.findMany({
      where,
      orderBy: { observedAt: "desc" },
    });

    // Also get prices from trades of consented members
    const trades = await prisma.trade.findMany({
      where: {
        userId: { in: consentedMemberIds },
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
        ...(commodityId && { commodityId }),
      },
    });

    // Aggregate by commodity
    const commoditySignals: Record<
      string,
      {
        prices: number[];
        markets: Set<string>;
        regionId: string | null;
      }
    > = {};

    // Process price reports
    for (const report of priceReports) {
      if (!commoditySignals[report.commodityId]) {
        commoditySignals[report.commodityId] = {
          prices: [],
          markets: new Set(),
          regionId: report.regionId,
        };
      }
      commoditySignals[report.commodityId].prices.push(report.price);
      commoditySignals[report.commodityId].markets.add(report.market);
    }

    // Process trades (use received price as market price indicator)
    for (const trade of trades) {
      if (!commoditySignals[trade.commodityId]) {
        commoditySignals[trade.commodityId] = {
          prices: [],
          markets: new Set(),
          regionId: group.regionId,
        };
      }
      commoditySignals[trade.commodityId].prices.push(trade.priceReceived);
      commoditySignals[trade.commodityId].markets.add(trade.marketSold);
    }

    // Calculate aggregated signals
    const signals = Object.entries(commoditySignals)
      .filter(([, data]) => data.prices.length >= MIN_OBSERVATIONS)
      .map(([commodityId, data]) => {
        const prices = data.prices.sort((a, b) => a - b);
        const sum = prices.reduce((acc, p) => acc + p, 0);
        const avg = sum / prices.length;
        const median =
          prices.length % 2 === 0
            ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
            : prices[Math.floor(prices.length / 2)];

        // Calculate standard deviation
        const squareDiffs = prices.map((p) => Math.pow(p - avg, 2));
        const avgSquareDiff =
          squareDiffs.reduce((acc, d) => acc + d, 0) / prices.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        return {
          commodityId,
          avgPrice: Math.round(avg * 100) / 100,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          medianPrice: Math.round(median * 100) / 100,
          stdDeviation: Math.round(stdDev * 100) / 100,
          observationCount: prices.length,
          markets: Array.from(data.markets),
          regionId: data.regionId,
          periodStart,
          periodEnd,
        };
      });

    return NextResponse.json({
      groupId,
      groupName: group.groupName,
      signals,
      memberCount: consentedMemberIds.length,
      periodStart,
      periodEnd,
    });
  } catch (error) {
    console.error("Error fetching group signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch group signals" },
      { status: 500 }
    );
  }
}

// POST /api/signals/group/generate - Generate/update group signals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, days = 7 } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId is required" },
        { status: 400 }
      );
    }

    // Fetch the group with members and consent
    const group = await prisma.solGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              include: {
                consent: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    if (!group.shareGroupPrices) {
      return NextResponse.json(
        { error: "Group price sharing is not enabled" },
        { status: 403 }
      );
    }

    const consentedMemberIds = group.members
      .filter((m) => m.user.consent?.shareWithGroup)
      .map((m) => m.userId);

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Get all price reports and trades
    const [priceReports, trades] = await Promise.all([
      prisma.priceReport.findMany({
        where: {
          userId: { in: consentedMemberIds },
          observedAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      prisma.trade.findMany({
        where: {
          userId: { in: consentedMemberIds },
          date: { gte: periodStart, lte: periodEnd },
        },
      }),
    ]);

    // Aggregate by commodity and market
    const aggregations: Record<
      string,
      {
        commodityId: string;
        market: string | null;
        regionId: string;
        prices: number[];
      }
    > = {};

    for (const report of priceReports) {
      const key = `${report.commodityId}|${report.market || "all"}`;
      if (!aggregations[key]) {
        aggregations[key] = {
          commodityId: report.commodityId,
          market: report.market,
          regionId: report.regionId,
          prices: [],
        };
      }
      aggregations[key].prices.push(report.price);
    }

    for (const trade of trades) {
      const key = `${trade.commodityId}|${trade.marketSold || "all"}`;
      if (!aggregations[key]) {
        aggregations[key] = {
          commodityId: trade.commodityId,
          market: trade.marketSold,
          regionId: group.regionId || "portauprince",
          prices: [],
        };
      }
      aggregations[key].prices.push(trade.priceReceived);
    }

    // Create or update signals
    const createdSignals = [];
    for (const [, data] of Object.entries(aggregations)) {
      if (data.prices.length < MIN_OBSERVATIONS) continue;

      const prices = data.prices.sort((a, b) => a - b);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const median =
        prices.length % 2 === 0
          ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
          : prices[Math.floor(prices.length / 2)];
      const squareDiffs = prices.map((p) => Math.pow(p - avg, 2));
      const stdDev = Math.sqrt(
        squareDiffs.reduce((a, b) => a + b, 0) / prices.length
      );

      // Use "all" as default market when not specified
      const marketKey = data.market || "all";

      const signal = await prisma.groupPriceSignal.upsert({
        where: {
          solGroupId_commodityId_market_periodStart: {
            solGroupId: groupId,
            commodityId: data.commodityId,
            market: marketKey,
            periodStart,
          },
        },
        update: {
          avgPrice: avg,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          medianPrice: median,
          stdDeviation: stdDev,
          observationCount: prices.length,
          periodEnd,
          shareWithRegion: group.shareGroupPrices,
        },
        create: {
          solGroupId: groupId,
          commodityId: data.commodityId,
          market: marketKey,
          regionId: data.regionId,
          avgPrice: avg,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          medianPrice: median,
          stdDeviation: stdDev,
          observationCount: prices.length,
          minObservations: MIN_OBSERVATIONS,
          periodStart,
          periodEnd,
          shareConsent: true,
          shareWithRegion: group.shareGroupPrices,
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
    console.error("Error generating group signals:", error);
    return NextResponse.json(
      { error: "Failed to generate group signals" },
      { status: 500 }
    );
  }
}
