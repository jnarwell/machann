import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Default IDs for demo (fallback when not logged in)
const DEMO_SOL_GROUP_ID = "demo-sol-group-1";

// GET /api/sol - Get sol group details with members
// If logged in: returns user's group(s)
// If not logged in: returns demo group
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const requestedGroupId = searchParams.get("groupId");

    // Determine which group to fetch
    let groupId = requestedGroupId;

    if (!groupId && session?.user?.id) {
      // User is logged in - find their first group
      const membership = await prisma.solMember.findFirst({
        where: { userId: session.user.id },
        select: { solGroupId: true },
      });
      groupId = membership?.solGroupId || null;
    }

    // Fall back to demo group if no group found
    if (!groupId) {
      groupId = DEMO_SOL_GROUP_ID;
    }

    const solGroup = await prisma.solGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, avatarColor: true, location: true },
            },
          },
          orderBy: { cycleOrder: "asc" },
        },
      },
    });

    if (!solGroup) {
      return NextResponse.json(
        { error: "Sol group not found" },
        { status: 404 }
      );
    }

    // Transform to expected format
    const response = {
      id: solGroup.id,
      groupName: solGroup.groupName,
      currentCycle: solGroup.currentCycle,
      totalCycles: solGroup.totalCycles,
      poolPerCycle: solGroup.poolPerCycle,
      contributionPerMember: solGroup.contributionPerMember,
      currentRecipientIndex: solGroup.currentRecipientIndex,
      nextCycleDate: solGroup.nextCycleDate.toISOString(),
      status: solGroup.status,
      isDemo: groupId === DEMO_SOL_GROUP_ID,
      currentUserId: session?.user?.id || null,
      members: solGroup.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        location: m.user.location,
        status: m.status,
        paidAmount: m.paidAmount,
        avatarColor: m.user.avatarColor,
        initials: m.user.initials,
        cycleOrder: m.cycleOrder,
        isCurrentUser: m.user.id === session?.user?.id,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching sol group:", error);
    return NextResponse.json(
      { error: "Failed to fetch sol group" },
      { status: 500 }
    );
  }
}

// POST /api/sol - Create a new sol group
// Requires authentication
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to create a sol group" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      groupName,
      totalCycles = 8,
      contributionPerMember,
      nextCycleDate,
      memberIds = [], // Array of user IDs to invite
    } = body;

    // Validate required fields
    if (!groupName || !contributionPerMember) {
      return NextResponse.json(
        { error: "groupName and contributionPerMember are required" },
        { status: 400 }
      );
    }

    // Calculate pool per cycle (include creator + invited members)
    const userId = session.user!.id;
    const allMemberIds = [userId, ...memberIds.filter((id: string) => id !== userId)];
    const poolPerCycle = contributionPerMember * allMemberIds.length;

    // Create the group
    const solGroup = await prisma.solGroup.create({
      data: {
        groupName,
        totalCycles,
        poolPerCycle,
        contributionPerMember,
        currentCycle: 1,
        currentRecipientIndex: 0,
        nextCycleDate: nextCycleDate ? new Date(nextCycleDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days
        status: "active",
      },
    });

    // Add members (creator first, then others)
    const memberPromises = allMemberIds.map((userId: string, index: number) =>
      prisma.solMember.create({
        data: {
          userId,
          solGroupId: solGroup.id,
          cycleOrder: index,
          status: index === 0 ? "recipient" : "upcoming", // First person is recipient
          paidAmount: 0,
        },
      })
    );

    await Promise.all(memberPromises);

    // Fetch the complete group with members
    const completeGroup = await prisma.solGroup.findUnique({
      where: { id: solGroup.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, initials: true, avatarColor: true, location: true },
            },
          },
          orderBy: { cycleOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      id: completeGroup!.id,
      groupName: completeGroup!.groupName,
      totalCycles: completeGroup!.totalCycles,
      poolPerCycle: completeGroup!.poolPerCycle,
      contributionPerMember: completeGroup!.contributionPerMember,
      members: completeGroup!.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        initials: m.user.initials,
      })),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating sol group:", error);
    return NextResponse.json(
      { error: "Failed to create sol group" },
      { status: 500 }
    );
  }
}

// PATCH /api/sol - Update member payment status or advance cycle
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { memberId, groupId, action, amount } = body;

    const solGroupId = groupId || DEMO_SOL_GROUP_ID;

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    // For cycle advancement, require auth and group membership
    if (action === "advanceCycle") {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Verify user is member of this group
      const userMembership = await prisma.solMember.findFirst({
        where: { userId: session.user.id, solGroupId },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "You are not a member of this group" },
          { status: 403 }
        );
      }

      // Advance the cycle
      const group = await prisma.solGroup.findUnique({
        where: { id: solGroupId },
        include: { members: { orderBy: { cycleOrder: "asc" } } },
      });

      if (!group) {
        return NextResponse.json(
          { error: "Group not found" },
          { status: 404 }
        );
      }

      const nextRecipientIndex = (group.currentRecipientIndex + 1) % group.members.length;
      const nextCycle = group.currentCycle + 1;

      // Update group
      await prisma.solGroup.update({
        where: { id: solGroupId },
        data: {
          currentCycle: nextCycle,
          currentRecipientIndex: nextRecipientIndex,
          nextCycleDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Reset to 30 days
        },
      });

      // Reset all member statuses
      await prisma.solMember.updateMany({
        where: { solGroupId },
        data: { status: "upcoming", paidAmount: 0 },
      });

      // Set new recipient
      const newRecipient = group.members[nextRecipientIndex];
      await prisma.solMember.update({
        where: { id: newRecipient.id },
        data: { status: "recipient" },
      });

      return NextResponse.json({ success: true, newCycle: nextCycle, newRecipientIndex: nextRecipientIndex });
    }

    // For member status updates
    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required for this action" },
        { status: 400 }
      );
    }

    // Find the membership
    const membership = await prisma.solMember.findFirst({
      where: {
        userId: memberId,
        solGroupId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Member not found in this sol group" },
        { status: 404 }
      );
    }

    // Update based on action
    let updateData: { status?: string; paidAmount?: number } = {};

    switch (action) {
      case "markPaid":
        const group = await prisma.solGroup.findUnique({
          where: { id: solGroupId },
        });
        updateData = {
          status: "paid",
          paidAmount: amount || group?.contributionPerMember || 0,
        };
        break;
      case "markLate":
        updateData = { status: "late", paidAmount: 0 };
        break;
      case "setRecipient":
        updateData = { status: "recipient" };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedMembership = await prisma.solMember.update({
      where: { id: membership.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, initials: true, avatarColor: true, location: true },
        },
      },
    });

    return NextResponse.json({
      id: updatedMembership.user.id,
      name: updatedMembership.user.name,
      location: updatedMembership.user.location,
      status: updatedMembership.status,
      paidAmount: updatedMembership.paidAmount,
      avatarColor: updatedMembership.user.avatarColor,
      initials: updatedMembership.user.initials,
    });
  } catch (error) {
    console.error("Error updating sol member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
