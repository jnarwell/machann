import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Default user ID for demo (in production, this would come from auth)
const DEMO_USER_ID = "demo-user-1";

// GET /api/consent - Get current user's consent settings
export async function GET() {
  try {
    const consent = await prisma.userConsent.findUnique({
      where: { userId: DEMO_USER_ID },
    });

    if (!consent) {
      // Return default consent settings
      return NextResponse.json({
        userId: DEMO_USER_ID,
        shareWithGroup: false,
        shareWithRegion: false,
        shareWithNetwork: false,
        anonymizeData: true,
        shareMargin: false,
        shareRoutes: false,
        consentVersion: 1,
        isDefault: true,
      });
    }

    return NextResponse.json(consent);
  } catch (error) {
    console.error("Error fetching consent:", error);
    return NextResponse.json(
      { error: "Failed to fetch consent settings" },
      { status: 500 }
    );
  }
}

// PUT /api/consent - Update consent settings (full replace)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      shareWithGroup,
      shareWithRegion,
      shareWithNetwork,
      anonymizeData,
      shareMargin,
      shareRoutes,
    } = body;

    // Validate boolean fields
    const booleanFields = {
      shareWithGroup,
      shareWithRegion,
      shareWithNetwork,
      anonymizeData,
      shareMargin,
      shareRoutes,
    };

    for (const [key, value] of Object.entries(booleanFields)) {
      if (value !== undefined && typeof value !== "boolean") {
        return NextResponse.json(
          { error: `${key} must be a boolean` },
          { status: 400 }
        );
      }
    }

    // Business logic: Can't share at higher tiers without lower tiers
    if (shareWithNetwork && !shareWithRegion) {
      return NextResponse.json(
        { error: "Cannot share nationally without sharing regionally" },
        { status: 400 }
      );
    }

    if (shareWithRegion && !shareWithGroup) {
      return NextResponse.json(
        { error: "Cannot share regionally without sharing with group" },
        { status: 400 }
      );
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

    const consent = await prisma.userConsent.upsert({
      where: { userId: DEMO_USER_ID },
      update: {
        shareWithGroup: shareWithGroup ?? false,
        shareWithRegion: shareWithRegion ?? false,
        shareWithNetwork: shareWithNetwork ?? false,
        anonymizeData: anonymizeData ?? true,
        shareMargin: shareMargin ?? false,
        shareRoutes: shareRoutes ?? false,
      },
      create: {
        userId: DEMO_USER_ID,
        shareWithGroup: shareWithGroup ?? false,
        shareWithRegion: shareWithRegion ?? false,
        shareWithNetwork: shareWithNetwork ?? false,
        anonymizeData: anonymizeData ?? true,
        shareMargin: shareMargin ?? false,
        shareRoutes: shareRoutes ?? false,
      },
    });

    return NextResponse.json(consent);
  } catch (error) {
    console.error("Error updating consent:", error);
    return NextResponse.json(
      { error: "Failed to update consent settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/consent - Partial consent update
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Get existing consent
    let existing = await prisma.userConsent.findUnique({
      where: { userId: DEMO_USER_ID },
    });

    // Create default if doesn't exist
    if (!existing) {
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

      existing = await prisma.userConsent.create({
        data: {
          userId: DEMO_USER_ID,
          shareWithGroup: false,
          shareWithRegion: false,
          shareWithNetwork: false,
          anonymizeData: true,
          shareMargin: false,
          shareRoutes: false,
        },
      });
    }

    // Merge with existing
    const updates: Record<string, boolean> = {};
    const allowedFields = [
      "shareWithGroup",
      "shareWithRegion",
      "shareWithNetwork",
      "anonymizeData",
      "shareMargin",
      "shareRoutes",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "boolean") {
          return NextResponse.json(
            { error: `${field} must be a boolean` },
            { status: 400 }
          );
        }
        updates[field] = body[field];
      }
    }

    // Apply updates
    const newValues = {
      shareWithGroup: updates.shareWithGroup ?? existing.shareWithGroup,
      shareWithRegion: updates.shareWithRegion ?? existing.shareWithRegion,
      shareWithNetwork: updates.shareWithNetwork ?? existing.shareWithNetwork,
      anonymizeData: updates.anonymizeData ?? existing.anonymizeData,
      shareMargin: updates.shareMargin ?? existing.shareMargin,
      shareRoutes: updates.shareRoutes ?? existing.shareRoutes,
    };

    // Business logic validation
    if (newValues.shareWithNetwork && !newValues.shareWithRegion) {
      return NextResponse.json(
        { error: "Cannot share nationally without sharing regionally" },
        { status: 400 }
      );
    }

    if (newValues.shareWithRegion && !newValues.shareWithGroup) {
      return NextResponse.json(
        { error: "Cannot share regionally without sharing with group" },
        { status: 400 }
      );
    }

    const consent = await prisma.userConsent.update({
      where: { userId: DEMO_USER_ID },
      data: newValues,
    });

    return NextResponse.json(consent);
  } catch (error) {
    console.error("Error updating consent:", error);
    return NextResponse.json(
      { error: "Failed to update consent settings" },
      { status: 500 }
    );
  }
}
