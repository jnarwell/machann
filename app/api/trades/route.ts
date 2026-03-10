import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  createTradeSchema,
  updateTradeSchema,
  getTradesQuerySchema,
  safeValidate,
  validationErrorResponse,
} from "@/lib/validation";

// Default user ID for demo (in production, this would come from auth)
const DEMO_USER_ID = "demo-user-1";

// GET /api/trades - List all trades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = safeValidate(getTradesQuerySchema, {
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      commodityId: searchParams.get("commodityId") ?? undefined,
      includeTransport: searchParams.get("includeTransport") ?? undefined,
    });

    if (!queryResult.success) {
      return validationErrorResponse(queryResult.error);
    }

    const { limit, offset, commodityId, includeTransport } = queryResult.data;

    const where = {
      userId: DEMO_USER_ID,
      ...(commodityId && { commodityId }),
    };

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
        include: {
          supplier: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    // Calculate summary stats
    const allTrades = await prisma.trade.findMany({ where });

    // Calculate total profit (revenue - cost - transport)
    const totalProfit = allTrades.reduce((sum, t) => {
      const gross = (t.priceReceived - t.pricePaid) * t.qty;
      const transport = t.transportCostHtg || 0;
      return sum + (gross - transport);
    }, 0);

    // Calculate total transport costs
    const totalTransportCost = allTrades.reduce((sum, t) => {
      return sum + (t.transportCostHtg || 0);
    }, 0);

    const avgMargin =
      allTrades.length > 0
        ? allTrades.reduce((sum, t) => sum + t.margin, 0) / allTrades.length
        : 0;

    // Format trades response
    const formattedTrades = trades.map((t) => ({
      id: t.id,
      date: t.date,
      commodityId: t.commodityId,
      qty: t.qty,
      unit: t.unit,
      supplier: t.supplier,
      marketBought: t.marketBought,
      pricePaid: t.pricePaid,
      marketSold: t.marketSold,
      priceReceived: t.priceReceived,
      margin: t.margin,
      notes: t.notes,
      // Include transport fields if requested or always include if present
      ...((includeTransport || t.transportCostHtg || t.transportMode) && {
        transportCostHtg: t.transportCostHtg,
        transportMode: t.transportMode,
        roadCondition: t.roadCondition,
        weatherCondition: t.weatherCondition,
      }),
    }));

    return NextResponse.json({
      success: true,
      trades: formattedTrades,
      total,
      summary: {
        totalTrades: total,
        totalProfit: Math.round(totalProfit),
        totalTransportCost: Math.round(totalTransportCost),
        avgMargin: Math.round(avgMargin * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trades", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/trades - Create new trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(createTradeSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const {
      commodityId,
      qty,
      unit,
      supplierId,
      supplierName,
      marketBought,
      pricePaid,
      marketSold,
      priceReceived,
      notes,
      date,
      transportCostHtg,
      transportMode,
      roadCondition,
      weatherCondition,
    } = result.data;

    // Calculate margin
    const margin = ((priceReceived - pricePaid) / pricePaid) * 100;

    // If supplierName provided but no supplierId, find or create supplier
    let resolvedSupplierId = supplierId;
    if (!supplierId && supplierName) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: { name: supplierName },
      });

      if (existingSupplier) {
        resolvedSupplierId = existingSupplier.id;
      } else {
        const newSupplier = await prisma.supplier.create({
          data: {
            name: supplierName,
            location: marketBought,
            commodities: commodityId,
          },
        });
        resolvedSupplierId = newSupplier.id;
      }
    }

    // Ensure demo user exists
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

    const trade = await prisma.trade.create({
      data: {
        commodityId,
        qty,
        unit,
        supplierId: resolvedSupplierId,
        marketBought,
        pricePaid,
        marketSold,
        priceReceived,
        margin,
        notes,
        date,
        userId: DEMO_USER_ID,
        transportCostHtg: transportCostHtg ?? null,
        transportMode: transportMode ?? null,
        roadCondition: roadCondition ?? null,
        weatherCondition: weatherCondition ?? null,
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, ...trade }, { status: 201 });
  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create trade", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/trades - Update an existing trade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(updateTradeSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const {
      id,
      commodityId,
      qty,
      unit,
      supplierId,
      supplierName,
      marketBought,
      pricePaid,
      marketSold,
      priceReceived,
      notes,
      date,
      transportCostHtg,
      transportMode,
      roadCondition,
      weatherCondition,
    } = result.data;

    // Check if trade exists and belongs to demo user
    const existingTrade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { success: false, error: "Trade not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (existingTrade.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit this trade", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Calculate margin
    const margin = ((priceReceived - pricePaid) / pricePaid) * 100;

    // Handle supplier resolution
    let resolvedSupplierId = supplierId;
    if (!supplierId && supplierName) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: { name: supplierName },
      });

      if (existingSupplier) {
        resolvedSupplierId = existingSupplier.id;
      } else {
        const newSupplier = await prisma.supplier.create({
          data: {
            name: supplierName,
            location: marketBought,
            commodities: commodityId,
          },
        });
        resolvedSupplierId = newSupplier.id;
      }
    }

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        commodityId,
        qty,
        unit,
        supplierId: resolvedSupplierId,
        marketBought,
        pricePaid,
        marketSold,
        priceReceived,
        margin,
        notes,
        date,
        transportCostHtg: transportCostHtg ?? null,
        transportMode: transportMode ?? null,
        roadCondition: roadCondition ?? null,
        weatherCondition: weatherCondition ?? null,
      },
      include: {
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, ...updatedTrade });
  } catch (error) {
    console.error("Error updating trade:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update trade", code: "UPDATE_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/trades?id=xxx - Delete a trade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Trade ID is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Check if trade exists and belongs to demo user
    const existingTrade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!existingTrade) {
      return NextResponse.json(
        { success: false, error: "Trade not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (existingTrade.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this trade", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    await prisma.trade.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trade:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete trade", code: "DELETE_ERROR" },
      { status: 500 }
    );
  }
}
