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
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );
    const search = (searchParams.get("search") || "").trim();

    const skip = (page - 1) * limit;

    const whereCondition = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {};

    const audits = await prisma.presentation.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            totalScore: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            tests: true,
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalAudits = await prisma.presentation.count({ where: whereCondition });

    return NextResponse.json(
      {
        message: "Audits fetched successfully",
        page,
        limit,
        total: totalAudits,
        totalPages: Math.ceil(totalAudits / limit),
        audits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

