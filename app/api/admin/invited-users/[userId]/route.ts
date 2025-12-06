import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Get the inviting user to get their companyId
    const invitingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!invitingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get all accepted invitations sent by this user
    const acceptedInvitations = await prisma.invitation.findMany({
      where: {
        invitedById: userId,
        status: "ACCEPTED",
      },
      select: {
        email: true,
      },
    });

    const invitedUserEmails = acceptedInvitations.map((inv) => inv.email);

    if (invitedUserEmails.length === 0) {
      return NextResponse.json(
        {
          message: "No invited users found",
          users: [],
        },
        { status: 200 }
      );
    }

    // Get the actual user records for these emails, filtered by companyId
    const invitedUsers = await prisma.user.findMany({
      where: {
        email: { in: invitedUserEmails },
        companyId: invitingUser.companyId, // Filter by the inviting user's companyId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Invited users fetched successfully",
        users: invitedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching invited users:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

