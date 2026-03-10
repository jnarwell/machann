import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/users - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        avatarColor: true,
        initials: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, location, avatarColor, initials } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name is required (min 2 characters)" },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone || null,
        location: location || null,
        avatarColor: avatarColor || "#6B7C5E",
        initials: initials || name.substring(0, 2).toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        avatarColor: true,
        initials: true,
      },
    });

    // Create default consent settings
    await prisma.userConsent.create({
      data: {
        userId: user.id,
        shareWithGroup: true,
        shareWithRegion: false,
        shareWithNetwork: false,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users?id=xxx - Update user
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone, location, avatarColor, initials } = body;

    // Check user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check phone uniqueness if changing
    if (phone && phone !== existing.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(location !== undefined && { location: location || null }),
        ...(avatarColor && { avatarColor }),
        ...(initials && { initials }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        avatarColor: true,
        initials: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users?id=xxx - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting demo-user-1 (required for app to function)
    if (id === "demo-user-1") {
      return NextResponse.json(
        { error: "Cannot delete the demo user" },
        { status: 403 }
      );
    }

    // Delete user (cascades to related data)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
