import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Default user ID for demo (in production, this would come from auth)
const DEMO_USER_ID = "demo-user-1";

interface CommodityProfit {
  id: string;
  name: string;
  profit: number;
  count: number;
}

interface RouteProfit {
  from: string;
  to: string;
  avgMargin: number;
  count: number;
  totalProfit: number;
}

// GET /api/health - Get business health metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get("periodType") || "monthly";
    const periodDays = periodType === "weekly" ? 7 : periodType === "monthly" ? 30 : 90;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);
    const periodEnd = new Date();

    // Fetch trades in period
    const trades = await prisma.trade.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    if (trades.length === 0) {
      return NextResponse.json({
        periodStart,
        periodEnd,
        periodType,
        totalRevenue: 0,
        totalCost: 0,
        totalTransportCost: 0,
        netProfit: 0,
        avgMargin: 0,
        tradeCount: 0,
        totalVolume: 0,
        topCommodities: [],
        topRoutes: [],
        topSuppliers: [],
        trendData: [],
      });
    }

    // Calculate financial metrics
    let totalRevenue = 0;
    let totalCost = 0;
    let totalTransportCost = 0;
    let totalVolume = 0;

    const commodityProfits: Record<string, CommodityProfit> = {};
    const routeProfits: Record<string, RouteProfit> = {};
    const supplierProfits: Record<string, { id: string; name: string; profit: number; count: number }> = {};

    for (const trade of trades) {
      const revenue = trade.priceReceived * trade.qty;
      const cost = trade.pricePaid * trade.qty;
      const transport = trade.transportCostHtg || 0;
      const profit = revenue - cost - transport;

      totalRevenue += revenue;
      totalCost += cost;
      totalTransportCost += transport;
      totalVolume += trade.qty;

      // Track commodity profits
      if (!commodityProfits[trade.commodityId]) {
        commodityProfits[trade.commodityId] = {
          id: trade.commodityId,
          name: trade.commodityId, // Frontend will map to display name
          profit: 0,
          count: 0,
        };
      }
      commodityProfits[trade.commodityId].profit += profit;
      commodityProfits[trade.commodityId].count += 1;

      // Track route profits
      const routeKey = `${trade.marketBought}|${trade.marketSold}`;
      if (!routeProfits[routeKey]) {
        routeProfits[routeKey] = {
          from: trade.marketBought,
          to: trade.marketSold,
          avgMargin: 0,
          count: 0,
          totalProfit: 0,
        };
      }
      routeProfits[routeKey].totalProfit += profit;
      routeProfits[routeKey].count += 1;

      // Track supplier profits
      if (trade.supplier) {
        const supplierId = trade.supplier.id;
        if (!supplierProfits[supplierId]) {
          supplierProfits[supplierId] = {
            id: supplierId,
            name: trade.supplier.name,
            profit: 0,
            count: 0,
          };
        }
        supplierProfits[supplierId].profit += profit;
        supplierProfits[supplierId].count += 1;
      }
    }

    // Calculate average margin for routes
    for (const route of Object.values(routeProfits)) {
      const routeTrades = trades.filter(
        (t) => t.marketBought === route.from && t.marketSold === route.to
      );
      route.avgMargin = routeTrades.reduce((sum, t) => sum + t.margin, 0) / routeTrades.length;
    }

    const netProfit = totalRevenue - totalCost - totalTransportCost;
    const avgMargin = trades.reduce((sum, t) => sum + t.margin, 0) / trades.length;

    // Sort and get top items
    const topCommodities = Object.values(commodityProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const topRoutes = Object.values(routeProfits)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5)
      .map(({ from, to, avgMargin, count }) => ({ from, to, avgMargin, count }));

    const topSuppliers = Object.values(supplierProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Generate trend data (daily aggregations)
    const trendData: { date: string; revenue: number; profit: number; tradeCount: number }[] = [];
    const dayMap: Record<string, { revenue: number; profit: number; tradeCount: number }> = {};

    for (const trade of trades) {
      const dateKey = trade.date.toISOString().split("T")[0];
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { revenue: 0, profit: 0, tradeCount: 0 };
      }
      const revenue = trade.priceReceived * trade.qty;
      const cost = trade.pricePaid * trade.qty;
      const transport = trade.transportCostHtg || 0;
      dayMap[dateKey].revenue += revenue;
      dayMap[dateKey].profit += revenue - cost - transport;
      dayMap[dateKey].tradeCount += 1;
    }

    for (const [date, data] of Object.entries(dayMap).sort()) {
      trendData.push({ date, ...data });
    }

    // Calculate trend directions (compare first half to second half)
    const halfIndex = Math.floor(trendData.length / 2);
    const firstHalf = trendData.slice(0, halfIndex);
    const secondHalf = trendData.slice(halfIndex);

    const firstProfit = firstHalf.reduce((sum, d) => sum + d.profit, 0);
    const secondProfit = secondHalf.reduce((sum, d) => sum + d.profit, 0);
    const profitTrend = secondProfit > firstProfit * 1.1 ? "up" : secondProfit < firstProfit * 0.9 ? "down" : "stable";

    const firstVolume = firstHalf.reduce((sum, d) => sum + d.tradeCount, 0);
    const secondVolume = secondHalf.reduce((sum, d) => sum + d.tradeCount, 0);
    const volumeTrend = secondVolume > firstVolume * 1.1 ? "up" : secondVolume < firstVolume * 0.9 ? "down" : "stable";

    return NextResponse.json({
      periodStart,
      periodEnd,
      periodType,
      totalRevenue: Math.round(totalRevenue),
      totalCost: Math.round(totalCost),
      totalTransportCost: Math.round(totalTransportCost),
      netProfit: Math.round(netProfit),
      avgMargin: Math.round(avgMargin * 10) / 10,
      tradeCount: trades.length,
      totalVolume: Math.round(totalVolume * 10) / 10,
      topCommodities,
      topRoutes,
      topSuppliers,
      trendData,
      profitTrend,
      volumeTrend,
      marginTrend: "stable", // Would need historical snapshots to calculate
    });
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch health metrics" },
      { status: 500 }
    );
  }
}

// POST /api/health/generate - Generate and save a health snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const periodType = body.periodType || "monthly";
    const periodDays = periodType === "weekly" ? 7 : periodType === "monthly" ? 30 : 90;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);
    const periodEnd = new Date();

    // Fetch trades for snapshot
    const trades = await prisma.trade.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    if (trades.length === 0) {
      return NextResponse.json(
        { error: "No trades in period to generate snapshot" },
        { status: 400 }
      );
    }

    // Calculate metrics (same as GET)
    let totalRevenue = 0;
    let totalCost = 0;
    let totalTransportCost = 0;
    let totalVolume = 0;

    const commodityProfits: Record<string, { id: string; profit: number; count: number }> = {};
    const routeProfits: Record<string, { from: string; to: string; profit: number; count: number }> = {};
    const supplierProfits: Record<string, { id: string; name: string; profit: number; count: number }> = {};

    for (const trade of trades) {
      const revenue = trade.priceReceived * trade.qty;
      const cost = trade.pricePaid * trade.qty;
      const transport = trade.transportCostHtg || 0;
      const profit = revenue - cost - transport;

      totalRevenue += revenue;
      totalCost += cost;
      totalTransportCost += transport;
      totalVolume += trade.qty;

      if (!commodityProfits[trade.commodityId]) {
        commodityProfits[trade.commodityId] = { id: trade.commodityId, profit: 0, count: 0 };
      }
      commodityProfits[trade.commodityId].profit += profit;
      commodityProfits[trade.commodityId].count += 1;

      const routeKey = `${trade.marketBought}|${trade.marketSold}`;
      if (!routeProfits[routeKey]) {
        routeProfits[routeKey] = { from: trade.marketBought, to: trade.marketSold, profit: 0, count: 0 };
      }
      routeProfits[routeKey].profit += profit;
      routeProfits[routeKey].count += 1;

      if (trade.supplier) {
        if (!supplierProfits[trade.supplier.id]) {
          supplierProfits[trade.supplier.id] = { id: trade.supplier.id, name: trade.supplier.name, profit: 0, count: 0 };
        }
        supplierProfits[trade.supplier.id].profit += profit;
        supplierProfits[trade.supplier.id].count += 1;
      }
    }

    const netProfit = totalRevenue - totalCost - totalTransportCost;
    const avgMargin = trades.reduce((sum, t) => sum + t.margin, 0) / trades.length;

    const topCommodities = Object.values(commodityProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const topRoutes = Object.values(routeProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    const topSuppliers = Object.values(supplierProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        name: "Demo Machann",
        initials: "DM",
        location: "Port-au-Prince",
      },
    });

    // Create or update snapshot
    const snapshot = await prisma.businessHealthSnapshot.upsert({
      where: {
        userId_periodStart_periodType: {
          userId: DEMO_USER_ID,
          periodStart,
          periodType,
        },
      },
      update: {
        periodEnd,
        totalRevenue,
        totalCost,
        totalTransportCost,
        netProfit,
        avgMargin,
        tradeCount: trades.length,
        totalVolume,
        topCommodities: JSON.stringify(topCommodities),
        topRoutes: JSON.stringify(topRoutes),
        topSuppliers: JSON.stringify(topSuppliers),
      },
      create: {
        userId: DEMO_USER_ID,
        periodStart,
        periodEnd,
        periodType,
        totalRevenue,
        totalCost,
        totalTransportCost,
        netProfit,
        avgMargin,
        tradeCount: trades.length,
        totalVolume,
        topCommodities: JSON.stringify(topCommodities),
        topRoutes: JSON.stringify(topRoutes),
        topSuppliers: JSON.stringify(topSuppliers),
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    console.error("Error generating health snapshot:", error);
    return NextResponse.json(
      { error: "Failed to generate health snapshot" },
      { status: 500 }
    );
  }
}
