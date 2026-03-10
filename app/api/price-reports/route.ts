import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import {
  getPriceReportsQuerySchema,
  priceSchema,
  numericStringSchema,
  safeValidate,
  validationErrorResponse,
} from "@/lib/validation";

// Default user ID for demo (in production, this would come from auth)
const DEMO_USER_ID = "demo-user-1";

// Valid regions (matching existing API contract)
const VALID_REGIONS = [
  "portauprince",
  "artibonite",
  "north",
  "south",
  "west",
  "center",
  "northeast",
  "northwest",
  "southeast",
  "grandanse",
  "nippes",
] as const;

// Valid quality levels (matching existing API contract)
const VALID_QUALITIES = ["excellent", "good", "fair", "poor"] as const;

// Schema for creating a price report (API-specific with English terms)
const createPriceReportApiSchema = z.object({
  commodityId: z.string("Commodity ID is required").min(1, "Commodity ID cannot be empty"),
  market: z.string("Market is required").min(1, "Market cannot be empty").max(100, "Market name too long"),
  regionId: z.enum(VALID_REGIONS, "Invalid region"),
  price: numericStringSchema.pipe(priceSchema),
  unit: z.string().default("kg"),
  quality: z.enum(VALID_QUALITIES, "Invalid quality value").optional().nullable(),
  notes: z.string().max(500, "Notes too long").optional().nullable(),
  observedAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : new Date())),
  userId: z.string().optional(),
});

// GET /api/price-reports - List price reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = safeValidate(getPriceReportsQuerySchema, {
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      commodityId: searchParams.get("commodityId") ?? undefined,
      regionId: searchParams.get("regionId") ?? undefined,
      market: searchParams.get("market") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      allUsers: searchParams.get("allUsers") ?? undefined,
    });

    if (!queryResult.success) {
      return validationErrorResponse(queryResult.error);
    }

    const { limit, offset, commodityId, regionId, market, userId, allUsers } = queryResult.data;
    const effectiveUserId = userId || DEMO_USER_ID;

    const where = {
      ...(allUsers ? {} : { userId: effectiveUserId }),
      ...(commodityId && { commodityId }),
      ...(regionId && { regionId }),
      ...(market && { market }),
    };

    const [reports, total] = await Promise.all([
      prisma.priceReport.findMany({
        where,
        orderBy: { observedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { id: true, name: true, initials: true, avatarColor: true },
          },
        },
      }),
      prisma.priceReport.count({ where }),
    ]);

    // Calculate statistics for the returned data
    const stats = await prisma.priceReport.groupBy({
      by: ["commodityId"],
      where,
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      reports,
      total,
      stats: stats.map((s) => ({
        commodityId: s.commodityId,
        avgPrice: Math.round((s._avg.price || 0) * 100) / 100,
        minPrice: s._min.price,
        maxPrice: s._max.price,
        count: s._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching price reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch price reports", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/price-reports - Create new price report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(createPriceReportApiSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const {
      commodityId,
      market,
      regionId,
      price,
      unit,
      quality,
      notes,
      observedAt,
      userId: requestUserId,
    } = result.data;

    // Use provided userId or fall back to demo user
    const userId = requestUserId || DEMO_USER_ID;

    // Ensure user exists (check for provided user or create demo user)
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      // Create demo user if needed
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
    }

    const report = await prisma.priceReport.create({
      data: {
        commodityId,
        market,
        regionId,
        price,
        unit,
        quality: quality ?? null,
        notes: notes ?? null,
        observedAt,
        userId: userExists ? userId : DEMO_USER_ID,
      },
      include: {
        user: {
          select: { id: true, name: true, initials: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({ success: true, ...report }, { status: 201 });
  } catch (error) {
    console.error("Error creating price report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create price report", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/price-reports?id=xxx - Delete a price report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Report ID is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Check if report exists and belongs to user
    const report = await prisma.priceReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (report.userId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this report", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    await prisma.priceReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting price report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete price report", code: "DELETE_ERROR" },
      { status: 500 }
    );
  }
}
