import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Add pagination & search
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const search = (searchParams.get("search") || "").trim();

    const skip = (page - 1) * limit;

    // Get all emails of users who were invited (have accepted invitations)
    const acceptedInvitations = await prisma.invitation.findMany({
      where: {
        status: "ACCEPTED",
      },
      select: {
        email: true,
      },
    });

    const invitedUserEmails = acceptedInvitations.map((inv) => inv.email);

    // Build where condition - exclude invited users and apply search if provided
    const baseCondition: any = {
      email: {
        notIn: invitedUserEmails.length > 0 ? invitedUserEmails : [],
      },
    };

    const whereCondition = search
      ? {
          ...baseCondition,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              company: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : baseCondition;

    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        company: true,
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalUsers = await prisma.user.count({ where: whereCondition });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
