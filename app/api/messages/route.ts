import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  createMessageSchema,
  getMessagesQuerySchema,
  safeValidate,
  validationErrorResponse,
} from "@/lib/validation";

export const dynamic = 'force-dynamic';

// Default IDs for demo
const DEMO_USER_ID = "demo-user-1";
const DEMO_SOL_GROUP_ID = "demo-sol-group-1";

// GET /api/messages - List messages for a sol group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = safeValidate(getMessagesQuerySchema, {
      solGroupId: searchParams.get("solGroupId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      after: searchParams.get("after") ?? undefined,
    });

    if (!queryResult.success) {
      return validationErrorResponse(queryResult.error);
    }

    const { solGroupId, limit, after } = queryResult.data;
    const groupId = solGroupId || DEMO_SOL_GROUP_ID;

    const where = {
      solGroupId: groupId,
      ...(after && { timestamp: { gt: new Date(after) } }),
    };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { timestamp: "asc" },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, initials: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      messages,
      latestTimestamp:
        messages.length > 0
          ? messages[messages.length - 1].timestamp.toISOString()
          : after || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(createMessageSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { content, solGroupId } = result.data;
    const groupId = solGroupId || DEMO_SOL_GROUP_ID;

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

    // Ensure demo sol group exists
    await prisma.solGroup.upsert({
      where: { id: groupId },
      update: {},
      create: {
        id: groupId,
        groupName: "Sol Gwoup Anite",
        totalCycles: 8,
        poolPerCycle: 25000,
        contributionPerMember: 5000,
        nextCycleDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      },
    });

    const message = await prisma.message.create({
      data: {
        content,
        senderId: DEMO_USER_ID,
        solGroupId: groupId,
      },
      include: {
        sender: {
          select: { id: true, name: true, initials: true, avatarColor: true },
        },
      },
    });

    return NextResponse.json({ success: true, ...message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/messages?id=xxx - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Check if message exists and belongs to demo user
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { success: false, error: "Message not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Only allow deleting own messages
    if (existingMessage.senderId !== DEMO_USER_ID) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this message", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message", code: "DELETE_ERROR" },
      { status: 500 }
    );
  }
}
